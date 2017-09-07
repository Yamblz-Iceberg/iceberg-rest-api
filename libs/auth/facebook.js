const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');

const config = require('../config');
const User = require('../../dataModels/user').User;
const _ = require('lodash');
const error = require('rest-api-errors');


passport.use(new FacebookStrategy({
  clientID: process.env.FB_ID || config.get('fb_id'),
  clientSecret: process.env.FB_SECRET || config.get('fb_secret'),
  callbackURL: `${process.env.URL || `${config.get('base_url')}:${config.get('port')}/`}register/fb/callback`,
  passReqToCallback: true,
},
  ((req, accessToken, refreshToken, profile, next) => {
    const uniqueId = req.query.state.split(',')[2];

    const user = {
      userId: `fb_${profile.id}`,
      firstName: profile.displayName.split(' ')[0],
      lastName: profile.displayName.split(' ')[1],
      photo: profile.photos && profile.photos.length ? profile.photos[0].value : undefined,
      fbToken: accessToken,
      accType: 'user',
    };

    // FIXME: функция одинаковая для всех соцсетей, вынести в модуль
    User.findOne({ userId: user.userId })
      .then((userFound) => {
        if (userFound) {
          return User.findOneAndUpdate({ userId: user.userId }, user, { new: true })
            .then(_user => next(null, _user));
        }
        if (/^(fb|ya|vk)/.test(uniqueId)) {
          return next(new error.Unauthorized('AUTH_ERR', 'User unique id contains illegal characters'));
        }
        return User.findOneAndUpdate({ userId: uniqueId }, user, { new: true })
          .then((_user) => {
            if (!_user) {
              User.register(user, accessToken, (err, account) => {
                if (err) {
                  throw err;
                }
                return next(null, account);
              });
            }
            return next(null, _user);
          });
      })
      .catch(err => next(err));
  })));

