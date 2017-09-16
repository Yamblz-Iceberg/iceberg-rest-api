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
const status = require('../libs/auth/status');

const _ = require('lodash');

router.all('/*', passport.authenticate('bearer', { session: false }));

router.post('/', validation(validationParams.addLink), status.accountTypeMiddleware, (req, res, next) => {
  linkParser.getInfo(req.body.link)
    .then(info => Link.findOrCreate({ userAdded: req.user.userId, url: req.body.link },
      { favicon: info.favicon, name: info.name, photo: info.photo, description: req.body.description }, { upsert: true })
      .then(link => User.findOneAndUpdate({ userId: req.user.userId, 'bookmarks.bookmarkId': { $ne: link.result._id } },
        { $addToSet: { bookmarks: { bookmarkId: link.result._id, type: 'addedLinks' } } })
        .then(() => res.json(link))))
    .catch(err => next(err));
});

router.put('/like/:linkId', validation(validationParams.readLink), status.accountTypeMiddleware, (req, res, next) => {
  const linkId = mongoose.Types.ObjectId(req.params.linkId);
  Link.findOne({ _id: linkId })
    .then((link) => {
      const linkObject = link;
      if (!linkObject) {
        throw new error.NotFound('LINK_LIKE_ERR', 'Cannot like link that doesnt exist');
      }
      if (linkObject.usersLiked.indexOf(req.user.userId) !== -1) {
        linkObject.usersLiked = _.remove(linkObject.usersLiked, req.user.userId);
        linkObject.likes -= 1;
      } else {
        linkObject.usersLiked.push(req.user.userId);
        linkObject.likes += 1;
      }
      return linkObject.save()
        .then(() => res.end());
    })
    .catch(err => next(err));
});

router.put('/open/:linkId', validation(validationParams.readLink), (req, res, next) => {
  User.findOne({ userId: req.user.userId })
    .then((user) => {
      if (!user) {
        throw new error.NotFound('METRICS_OPEN_ERR', 'Cannot mark this link as opened');
      }
      const contentId = mongoose.Types.ObjectId(req.params.linkId);
      if (!_.find(user.metrics, ['contentId', contentId])) {
        user.metrics.push({ contentId, opened: true, type: 'link' });
      }
      return user.save()
        .then(() => res.end());
    })
    .catch(err => next(err));
});

module.exports = router;
