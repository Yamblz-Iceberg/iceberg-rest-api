const express = require('express');

const router = express.Router();
const User = require('.././dataModels/user').User;
const passport = require('passport');
const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');
const status = require('../libs/auth/status');
const social = require('../libs/social');


router.all('/*', passport.authenticate('bearer', { session: false }));

router.get('/:userId?', (req, res, next) => {
  User.findOne({ userId: req.params.userId ? req.params.userId : req.user.userId }, '-hash -salt -_id -__v')
    .then((user) => {
      if (!user) {
        throw new error.NotFound('NO_USER', 'User cannot be found');
      } else {
        res.json(user);
      }
    })
    .catch(err => next(err));
});

router.put('/', validation(validationParams.editUser), (req, res, next) => {
  User.findOneAndUpdate({ userId: req.user.userId }, req.body)
    .then((user) => {
      if (!user) {
        throw new error.NotFound('NO_USER', 'User cannot be found');
      } else {
        res.end();
      }
    })
    .catch(err => next(err));
});

router.delete('/', (req, res, next) => {
  User.findOneAndRemove({ userId: req.user.userId })
    .then((user) => {
      if (!user) {
        throw new error.NotFound('NO_USER', 'User cannot be found');
      } else {
        res.end();
      }
    })
    .catch(err => next(err));
});

router.get('/social/friends', status.accountTypeMiddleware, (req, res, next) => {
  social.getFriends(req.user)
    .then(response => res.json(response))
    .catch(err => next(err));
});

module.exports = router;
