const YandexStrategy = require('passport-yandex').Strategy;
const passport = require('passport');

const config = require('../config');
const _ = require('lodash');
const social = require('../social');


passport.use(new YandexStrategy({
  clientID: process.env.YANDEX_ID || config.get('ya_id'),
  clientSecret: process.env.YANDEX_SECRET || config.get('ya_secret'),
  callbackURL: `${process.env.URL || `${config.get('base_url')}:${config.get('port')}/`}register/yandex/callback`,
  passReqToCallback: true,
},
  ((req, accessToken, refreshToken, params, profile, next) => {
    const uniqueId = req.query.state.split(',')[2];

    const user = {
      userId: `ya_${profile.id}`,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      photo: `https://avatars.yandex.net/get-yapic/${_.get(profile._json, 'default_avatar_id')}/islands-200`,
      sex: profile.gender,
      yaToken: accessToken,
      accType: 'user',
    };

    social.createUser(user, uniqueId, accessToken)
      .then(socialUser => next(null, socialUser))
      .catch(err => next(err));
  })));

