const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');

const config = require('../config');
const User = require('../../dataModels/user').User;


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
      fbToken: accessToken,
      accType: 'user',
    };

    User.findOneAndUpdate({ $or: [{ userId: user.userId }, { userId: uniqueId }] }, user, { new: true })
      .then(_user => next(null, _user))
      .catch(err => next(err));
  })));

