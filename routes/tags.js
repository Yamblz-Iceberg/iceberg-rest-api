const express = require('express');

const router = express.Router();

const passport = require('passport');

const Tag = require('.././dataModels/tag').Tag;
const User = require('.././dataModels/user').User;
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');
const status = require('../libs/auth/status');

const _ = require('lodash');

router.all('/*', passport.authenticate('bearer', { session: false }));

router.post('/:tagName', validation(validationParams.tag), status.accountTypeMiddleware, (req, res, next) => {
  Tag.findOrCreate({ name: req.params.tagName.toLowerCase().replace(/[^A-Z_a-z0-9а-яА-Я]/g, '') })
    .then(tag => res.json({ tag }))
    .catch(err => next(err));
});

router.put('/personal', validation(validationParams.personalTags), (req, res, next) =>
  Promise.each(req.body.tags, (tag =>
    User.findOne({ userId: req.user.userId })
      .then((user) => {
        if (!user) {
          throw new error.BadRequest('ADD_PERSONAL_TAGS_ERR', 'Cannot add personal tags for user that doesnt exist');
        }
        const bookmark = _.find(user.bookmarks, ['bookmarkId', mongoose.Types.ObjectId(tag)]);
        if (!bookmark) {
          user.bookmarks.push({ bookmarkId: mongoose.Types.ObjectId(tag), type: 'personalTags' });
        } else {
          if (!bookmark.counter) bookmark.counter = 1;
          bookmark.counter += 1;
        }
        return user.save();
      })))
    .then(() => res.end())
    .catch(err => next(err)));


module.exports = router;
