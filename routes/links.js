const express = require('express');

const router = express.Router();

const passport = require('passport');

const Link = require('.././dataModels/link').Link;
const User = require('.././dataModels/user').User;
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const linkParser = require('./../libs/linkParser');
const error = require('rest-api-errors');

const _ = require('lodash');

router.post('/', validation(validationParams.addLink), passport.authenticate('bearer', { session: false }), (req, res, next) => {
  linkParser.getInfo(req.body.link)
    .then(info => Link.findOrCreate({ userAdded: req.user.userId, url: req.body.link },
      { favicon: info.favicon, name: info.name, photo: info.photo, description: req.body.description }, { upsert: true })
      .then(link => User.findOneAndUpdate({ userId: req.user.userId },
        { $addToSet: { addedLinks: { bookmarkId: link.result._id } } })
        .then((user) => {
          if (!user) {
            throw new error.NotFound('NO_USER_ERR', 'User not found');
          }
          res.json(link);
        })))
    .catch(err => next(err));
});

router.put('/read/:linkId', validation(validationParams.readLink), passport.authenticate('bearer', { session: false }), (req, res, next) => {


});

module.exports = router;
