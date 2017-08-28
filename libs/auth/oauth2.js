const oauth2orize = require('oauth2orize');
const passport = require('passport');
const crypto = require('crypto');

const config = require('../config');
const User = require('../../dataModels/user').User;
const AccessToken = require('../../dataModels/accessToken').AccessToken;
const RefreshToken = require('../../dataModels/refreshToken');
const error = require('rest-api-errors');


// create OAuth 2.0 server
const aserver = oauth2orize.createServer();


// Destroys any old tokens and generates a new access and refresh token
const generateTokens = (data, done) => {
  const dataNew = data;
  const refreshTokenValue = crypto.randomBytes(32).toString('hex');
  const tokenValue = crypto.randomBytes(32).toString('hex');
  // RefreshToken.remove(data, errorHandler);
  // AccessToken.remove(data, errorHandler);

  dataNew.token = tokenValue;
  const token = new AccessToken(data);

  dataNew.token = refreshTokenValue;
  const refreshToken = new RefreshToken(data);

  refreshToken.save()
    .then(() => token.save())
    .then(() => done(null, tokenValue, refreshTokenValue, {
      expires_in: config.get('security:tokenLife'),
    }));
};

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password((client, userId, password, scope, next) => {
  User.findByUsername(userId)
    .then((user) => {
      if (!user) {
        throw next(new error.Forbidden('AUTH_ERROR_GRANTS', 'User not found'));
      }
      const model = {
        clientId: client.clientId,
      };

      if (user.vkToken === password || user.fbToken === password) {
        model.userId = user.userId;
        generateTokens(model, next);
      } else { // FIXME: check
        user.authenticate(password, (err, thisModel, passwordErr) => {
          if (err) {
            throw err;
          }
          if (passwordErr) {
            throw passwordErr;
          }
          model.userId = thisModel.userId;

          generateTokens(model, next);
        });
      }
    })
    .catch(err => next(err));
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  RefreshToken.findOneAndRemove({ token: refreshToken, clientId: client.clientId }) // FIXME: not sure about deleting
    .then((token) => {
      if (!token) {
        return done(null, false);
      }
      return User.findOne({ userId: token.userId })
        .then((user) => {
          if (!user) {
            return done(null, false);
          }
          const model = {
            userId: user.userId,
            clientId: client.clientId,
          };
          return generateTokens(model, done);
        });
    })
    .catch(err => done(err));
}));

module.exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], {
    session: false,
  }),
  aserver.token(),
  aserver.errorHandler(),
];

module.exports.generateTokens = generateTokens;
