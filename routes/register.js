const express = require('express');

const config = require('../libs/config');
const passport = require('passport');

const router = express.Router();
const _ = require('lodash');

const User = require('.././dataModels/user').User;
const AccessToken = require('.././dataModels/accessToken').AccessToken;
const RefreshToken = require('.././dataModels/refreshToken');
const request = require('request');
const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');


const getGrants = (userObject, type = 'user') => {
  const user = {};
  user.main = _.omit(userObject, 'password');
  user.password = _.get(userObject, 'password');
  user.main.accType = type;
  return user;
};

const getStateParams = state => new Promise((resolve, reject) => {
  if (!state) {
    reject(new error.BadRequest('INVALID_STATE_PARAMETRS', 'State param was not found due social auth'));
  }
  const stateArray = state.split(',');

  if (stateArray.length !== 3) {
    reject(new error.BadRequest('INVALID_STATE_LENGTH', 'State param must consist of 3 elements separated by single comma'));
  }

  const stateObj = {};
  [stateObj.clientId, stateObj.clientSecret, stateObj.uniqueId] = stateArray; // es6 destructurisation
  resolve(stateObj);
});

const redirectOauth = (clientId, clientSecret, username, password) => new Promise((resolve, reject) => {
  const options = {
    method: 'POST',
    url: `${process.env.URL || `${config.get('base_url')}:${config.get('port')}/`}oauth/token`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    form:
      {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
      },
  };

  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    }
    try {
      const content = JSON.parse(body);
      resolve(content);
    } catch (_err) {
      reject(_err);
    }
  });
});

const checkVKToken = (userId, token) => new Promise((resolve, reject) => {
  const options = {
    method: 'POST',
    url: 'https://api.vk.com/method/secure.checkToken',
    qs: {
      token,
    },
  };

  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    }

    const vkRes = JSON.parse(body);
    if (!vkRes.success) {
      reject(vkRes.error.error_msg);
    }
    resolve(userId === vkRes.user_id);
  });
});


router.post('/demo', validation(validationParams.register), passport.authenticate(['basic'], { session: false }), (req, res, next) => {
  const user = getGrants(req.body, 'demo');
  User.register(user.main, user.password, (err, account) => {
    if (err) {
      return next(err);
    }
    return redirectOauth(req.user.clientId, req.user.clientSecret, account.userId, user.password)
      .then(responce => res.json(responce))
      .catch(_error => next(_error));
  });
});

router.post('/basic', validation(validationParams.register), passport.authenticate(['basic'], { session: false }), (req, res, next) => {
  const user = getGrants(req.body);
  User.register(user.main, user.password, (err, account) => {
    if (err) {
      return next(err);
    }
    return redirectOauth(req.user.clientId, req.user.clientSecret, account.userId, user.password)
      .then(responce => res.json(responce))
      .catch(_error => next(_error));
  });
});

router.get('/vk', validation(validationParams.social), passport.authenticate('basic', { session: false }), (req, res, next) => {
  passport.authenticate('vkontakte', {
    display: 'mobile',
    state: `${req.user.clientId},${req.user.clientSecret},${req.query.uniqueId}`,
    scope: ['friends'],
  })(req, res, next);
});

router.get('/fb', validation(validationParams.social), passport.authenticate('basic', { session: false }), (req, res, next) => {
  passport.authenticate('facebook', {
    state: `${req.user.clientId},${req.user.clientSecret},${req.query.uniqueId}`,
    scope: ['user_friends'],
  })(req, res, next);
});

router.get('/ya', validation(validationParams.social), passport.authenticate('basic', { session: false }), (req, res, next) => {
  passport.authenticate('yandex', {
    state: `${req.user.clientId},${req.user.clientSecret},${req.query.uniqueId}`,
  })(req, res, next);
});

router.get('/vk/callback', passport.authenticate('vkontakte', { session: false }), (req, res, next) => {
  getStateParams(req.query.state)
    .then(state => redirectOauth(state.clientId, state.clientSecret, req.user.userId, req.user.vkToken))
    .then(responce => res.json(responce))
    .catch(err => next(err));
});

router.get('/fb/callback', passport.authenticate('facebook', { session: false }), (req, res, next) => {
  getStateParams(req.query.state)
    .then(state => redirectOauth(state.clientId, state.clientSecret, req.user.userId, req.user.fbToken))
    .then(responce => res.json(responce))
    .catch(err => next(err));
});

router.get('/yandex/callback', passport.authenticate('yandex', { session: false }), (req, res, next) => {
  getStateParams(req.query.state)
    .then(state => redirectOauth(state.clientId, state.clientSecret, req.user.userId, req.user.yaToken))
    .then(responce => res.json(responce))
    .catch(err => next(err));
});

router.put('/logout', validation(validationParams.logout), passport.authenticate('basic', { session: false }), (req, res, next) => {
  AccessToken.remove({ clientId: req.user.clientId, token: req.body.accessToken })
    .then(() => RefreshToken.remove({ clientId: req.user.clientId, token: req.body.refreshToken })) // все равно на ошибки, ведь мы удаляем
    .then(() => res.end())
    .catch(err => next(err));
});

router.put('/logoutall', passport.authenticate('bearer', { session: false }), (req, res, next) => {
  AccessToken.remove({ userId: req.user.userId })
    .then(() => RefreshToken.remove({ userId: req.user.userId }))
    .then(() => res.end())
    .catch(err => next(err));
});

module.exports = router;

