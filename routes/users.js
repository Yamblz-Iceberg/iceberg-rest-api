const express = require('express');

const router = express.Router();
const User = require('.././dataModels/user').User;
const Collection = require('.././dataModels/collection').Collection;
const Link = require('.././dataModels/link').Link;
const mongoose = require('mongoose');
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

router.all('/bookmarks/:type/:id?', validation(validationParams.bookmarks), passport.authenticate('bearer', { session: false }), (req, res, next) => {
  const COLLECTIONS = 'collections';

  let bookmarksAction = {};
  let userAction = {};

  const collectionsActionDestination = { savedCollections: mongoose.Types.ObjectId(req.params.id) };
  const linksActionDestination = { savedLinks: mongoose.Types.ObjectId(req.params.id) };
  const userActionDestination = { usersSaved: req.user.userId };

  const mongoCollection = req.params.type === COLLECTIONS ? Collection : Link;

  if (req.method === 'PUT' && req.params.id) {
    bookmarksAction = { $addToSet: userActionDestination };
    userAction = { $addToSet: req.params.type === COLLECTIONS ? collectionsActionDestination : linksActionDestination };
  } else if (req.method === 'DELETE' && req.params.id) {
    bookmarksAction = { $pull: userActionDestination };
    userAction = { $pull: req.params.type === COLLECTIONS ? collectionsActionDestination : linksActionDestination };
  }

  mongoCollection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) },
    bookmarksAction)
    .then((bookmark) => {
      if (!bookmark && req.params.id) {
        throw new error.NotFound('NO_BOOKMARKS_ERR', 'Bookmarks not found');
      }
      return User.findOneAndUpdate({ userId: req.user.userId }, userAction)
        .then((user) => {
          if (!user) {
            throw new error.NotFound('NO_USER_ERR', 'User not found, cannot update this user');
          }
          const resposeBookmarks = req.params.type === COLLECTIONS ? { savedCollections: user.savedCollections } : { savedLinks: user.savedLinks };
          res.json(req.method === 'GET' ? resposeBookmarks : { result: 'success' });
        });
    })
    .catch(err => next(err));
});

module.exports = router;
