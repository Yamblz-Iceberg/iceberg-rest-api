const VKontakteStrategy = require('passport-vkontakte').Strategy;
const passport = require('passport');

const config = require('../config');
const User = require('../../dataModels/user').User;
const _ = require('lodash');


passport.use(new VKontakteStrategy({
  clientID: process.env.VK_ID || config.get('vk_id'), // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
  clientSecret: process.env.VK_SECRET || config.get('vk_secret'),
  callbackURL: `${process.env.URL || `${config.get('base_url')}:${config.get('port')}/`}register/vk/callback`,
  profileFields: ['photo_max_orig'],
  passReqToCallback: true,
},
  ((req, accessToken, _refreshToken, params, profile, done) => {
    const uniqueId = req.query.state.split(',')[2];

    const user = {
      userId: `vk_${profile.id}`,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      photo: _.chain(profile.photos).find(['type', 'photo_max_orig']).get('value', 'reportlogo.png'), // set default photo
      // fcmToken: null, // FIXME: why?
      sex: profile.gender,
      socialLink: profile.profileUrl,
      vkToken: accessToken,
      accType: 'user',
    };

    // FIXME: продумать решение, если регистрироваться без демо
    User.findOne({ userId: user.userId })
      .then((userFound) => {
        if (userFound) {
          User.findOneAndUpdate({ userId: user.userId }, user, { new: true })
            .then(_user => done(null, _user));
        } else {
          User.findOneAndUpdate({ userId: uniqueId }, user, { new: true })
            .then(_user => done(null, _user));
        }
      })
      .catch(err => done(err));
  })));

