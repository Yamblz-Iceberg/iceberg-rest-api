const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const config = require('../config');
const status = require('./status');
const error = require('rest-api-errors');

const User = require('../../dataModels/user').User;
const Client = require('../../dataModels/client').Client;
const AccessToken = require('../../dataModels/accessToken').AccessToken;

passport.use(new BasicStrategy(
  (username, password, next) => {
    Client.findOne({ clientId: username })
      .then((client) => {
        if (!client) {
          throw next(new error.Unauthorized('AUTH_ERROR_GRANTS', 'Client not found'));
        }
        if (client.clientSecret !== password) {
          throw next(new error.Unauthorized('AUTH_ERROR_GRANTS', 'Client secret is wrong'));
        }
        return next(null, client);
      })
      .catch(err => next(err));
  }));

passport.use(new ClientPasswordStrategy(
  (clientId, clientSecret, next) => {
    Client.findOne({ clientId })
      .then((client) => {
        if (!client) {
          throw next(new error.Unauthorized('AUTH_ERROR_GRANTS', 'Client not found'));
        }
        if (client.clientSecret !== clientSecret) {
          throw next(new error.Unauthorized('AUTH_ERROR_GRANTS', 'Client secret is wrong'));
        }
        return next(null, client);
      })
      .catch(err => next(err));
  }));

passport.use(new LocalStrategy(
  (userId, password, next) => {
    User.findByUsername(userId)
      .then((user) => {
        if (!user) {
          throw next(new error.Unauthorized('AUTH_ERROR_GRANTS', 'User not found'));
        }
        user.authenticate(password, (err, thisModel, passwordErr) => {
          if (err) {
            throw err;
          }
          if (passwordErr) {
            throw passwordErr;
          }
          status.isBlocked(thisModel, next);
        });
      })
      .catch(err => next(err));
  }));

passport.use(new BearerStrategy(
  (accessToken, next) => {
    AccessToken.findOne({ token: accessToken })
      .then((token) => {
        if (!token) {
          throw next(new error.Unauthorized('AUTH_ERROR_TOKEN', 'Token not found'));
        }
        if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife') &&
          token.userId !== config.get('default:user:username')) {
          return AccessToken.remove({ token: accessToken })
            .then(() => {
              throw next(new error.Unauthorized('AUTH_ERROR_TOKEN', 'Token expiried'));
            });
        }
        return User.findOne({ userId: token.userId })
          .then((user) => {
            if (!user) {
              throw next(new error.Unauthorized('AUTH_ERROR_TOKEN', 'User not found'));
            }
            const info = {
              scope: '*',
            };
            // check for user type and banned
            status.isBlocked(user, next, info);
          });
      })
      .catch(err => next(err));
  }));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
