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


const getGrants = (userObject, type = 'user') => new Promise((resolve, reject) => {
  if (!userObject) {
    reject(new error.BadRequest('INVALID_USER_DATA_ERR', 'User data is invalid or emty'));
  }
  const user = {};
  user.main = _.omit(userObject, 'password'); // убрать lodash
  user.password = _.get(userObject, 'password');
  user.main.accType = type;
  resolve(user);
});

const getStateParams = state => new Promise((resolve, reject) => {
  if (!state) {
    reject(new error.BadRequest('INVALID_STATE_PARAMETRS', 'State param was not found due social auth'));
  }
  const stateArray = state.split(',');

  if (stateArray.length !== 3) {
    reject(new error.BadRequest('INVALID_STATE_LENGTH_ERR', 'State param must consist of 3 elements separated by single comma'));
  }

  const stateObj = {};
  [stateObj.clientId, stateObj.clientSecret, stateObj.uniqueId] = stateArray;
  resolve(stateObj);
});

const redirectOauth = (clientId, clientSecret, username, password) => new Promise((resolve, reject) => {
  const options = {
    method: 'POST',
    url: `${process.env.URL || `${config.get('base_url')}:${process.env.PORT || config.get('port')}/`}oauth/token`,
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

router.post('/basic', validation(validationParams.register), passport.authenticate(['basic'], { session: false }), (req, res, next) => {
  getGrants(req.body)
    .then(user => User.register(user.main, user.password, (err, account) => { // переделать на promise
      if (err) {
        return next(err);
      }
      return redirectOauth(req.user.clientId, req.user.clientSecret, account.userId, user.password)
        .then(responce => res.json(responce));
    }))
    .catch(_error => next(_error));
});


router.post('/demo', validation(validationParams.register), passport.authenticate(['basic'], { session: false }), (req, res, next) => {
  getGrants(req.body, 'demo')
    .then(user => User.register(user.main, user.password, (err, account) => { // переделать на promise
      if (err) {
        return next(err);
      }
      return redirectOauth(req.user.clientId, req.user.clientSecret, account.userId, user.password)
        .then(responce => res.json(responce));
    }))
    .catch(_error => next(_error));
});

router.get('/:social', validation(validationParams.social), (req, res, next) => {
  let strategy;
  let scope;
  let display;
  switch (req.params.social) {
  case 'vk': strategy = 'vkontakte'; display = 'mobile'; scope = ['friends'];
    break;
  case 'fb': strategy = 'facebook'; display = 'touch'; scope = ['user_friends'];
    break;
  case 'ya': strategy = 'yandex';
    break;
  default: strategy = req.params.social;
  }
  passport.authenticate(strategy, {
    display,
    state: `${req.query.clientId},${req.query.clientSecret},${req.query.uniqueId}`,
    scope,
  })(req, res, next);
});

router.get('/:social/callback', (req, res, next) => {
  let strategy;
  switch (req.params.social) {
  case 'vk': strategy = 'vkontakte';
    break;
  case 'fb': strategy = 'facebook';
    break;
  default: strategy = req.params.social;
  }
  passport.authenticate(strategy, { session: false })(req, res, () => {
    let token;
    switch (req.params.social) {
    case 'vk': token = req.user.vkToken;
      break;
    case 'fb': token = req.user.fbToken;
      break;
    default: token = req.user.yaToken;
    }
    getStateParams(req.query.state)
      .then(state => redirectOauth(state.clientId, state.clientSecret, req.user.userId, token))
      .then(response => res.render('callback', { response: JSON.stringify(response) }))
      .catch(err => next(err));
  });
});

router.put('/logout', validation(validationParams.logout), passport.authenticate('basic', { session: false }), (req, res, next) => {
  AccessToken.remove({ clientId: req.user.clientId, token: req.body.accessToken })
    .then(() => RefreshToken.remove({ clientId: req.user.clientId, token: req.body.refreshToken }))
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

