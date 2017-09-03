const YandexStrategy = require('passport-yandex').Strategy;
const passport = require('passport');

const config = require('../config');
const User = require('../../dataModels/user').User;
const _ = require('lodash');


passport.use(new YandexStrategy({
  clientID: process.env.YANDEX_ID || config.get('ya_id'),
  clientSecret: process.env.YANDEX_SECRET || config.get('ya_secret'),
  callbackURL: `${process.env.URL || `${config.get('base_url')}:`}${process.env.PORT || `${config.get('port')}/`}register/yandex/callback`,
  passReqToCallback: true,
},
  ((req, accessToken, _refreshToken, params, profile, done) => {
    const uniqueId = req.query.state.split(',')[2];

    const user = {
      userId: `ya_${profile.id}`,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      // photo: _.chain(profile.photos).find(['type', 'photo_max_orig']).get('value', 'reportlogo.png'), // set default photo
      sex: profile.gender,
      socialLink: profile.profileUrl,
      yaToken: accessToken,
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

