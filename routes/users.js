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
        throw new error.NotFound('NO_USER_ERR', 'User cannot be found');
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
        throw new error.NotFound('NO_USER_ERR', 'User cannot be found');
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
        throw new error.NotFound('NO_USER_ERR', 'User cannot be found');
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
  const MY_COLLECTIONS = 'myCollections';
  const LINKS = 'links';
  const MY_LINKS = 'myLinks';

  const types = [COLLECTIONS, LINKS];
  const myTypes = [MY_COLLECTIONS, MY_LINKS];

  if (['GET', 'PUT', 'DELETE'].indexOf(req.method) === -1 && types.indexOf(req.params.type) !== -1) {
    return next(new error.MethodNotAllowed('BOOKMARKS_ERR', 'Method not allowed for saved content'));
  } else if (['GET', 'DELETE'].indexOf(req.method) === -1 && myTypes.indexOf(req.params.type) !== -1) {
    return next(new error.MethodNotAllowed('BOOKMARKS_ERR', 'Method not allowed for user created content'));
  }

  let bookmarksAction = {};
  let userAction = {};

  const collectionsActionDestination = { savedCollections: mongoose.Types.ObjectId(req.params.id) };
  const collectionsCreatedActionDestination = { createdCollections: mongoose.Types.ObjectId(req.params.id) };
  const linksActionDestination = { savedLinks: mongoose.Types.ObjectId(req.params.id) };
  const linksActionAddedDestination = { addedLinks: mongoose.Types.ObjectId(req.params.id) };

  const userActionDestination = { usersSaved: req.user.userId };

  const mongoCollection = (req.params.type === COLLECTIONS || req.params.type === MY_COLLECTIONS) ? Collection : Link;

  if (req.method === 'PUT' && req.params.id && types.indexOf(req.params.type) !== -1) {
    bookmarksAction = { $addToSet: userActionDestination };
    userAction = { $addToSet: req.params.type === COLLECTIONS ? collectionsActionDestination : linksActionDestination };
  } else if (req.method === 'DELETE' && req.params.id) {
    switch (req.params.type) {
    case (COLLECTIONS): userAction = { $pull: collectionsActionDestination };
      bookmarksAction = { $pull: userActionDestination };
      break;
    case (MY_COLLECTIONS): userAction = { $pull: collectionsCreatedActionDestination };
      break;
    case (LINKS): userAction = { $pull: linksActionDestination };
      bookmarksAction = { $pull: userActionDestination };
      break;
    case (MY_LINKS): userAction = { $pull: linksActionAddedDestination };
      break;
    default:
      return next(new error.BadRequest('BOOKMARKS_ERR', 'Bookmarks destination not found'));
    }
  }

  return mongoCollection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) },
    bookmarksAction)
    .then((bookmark) => {
      if (!bookmark && req.params.id) {
        throw new error.NotFound('NO_BOOKMARKS_ERR', 'Bookmarks not found');
      }
      return User.findOneAndUpdate({ userId: req.user.userId },
        userAction)
        .then((user) => {
          if (!user) {
            throw new error.NotFound('NO_USER_ERR', 'User not found, cannot update this user');
          }
          if (req.method === 'GET') {
            if (req.params.type === COLLECTIONS || req.params.type === MY_COLLECTIONS) {
              return Collection.aggregate([
                {
                  $match: { _id: req.params.type === COLLECTIONS ? { $in: user.savedCollections.map(id => mongoose.Types.ObjectId(id)) } :
                    { $in: user.createdCollections.map(id => mongoose.Types.ObjectId(id)) } },
                },
                {
                  $unwind: { path: '$author', preserveNullAndEmptyArrays: true },
                },
                {
                  $lookup:
                     {
                       from: 'users',
                       localField: 'authorId',
                       foreignField: 'userId',
                       as: 'author',
                     },
                },
                {
                  $unwind: { path: '$author', preserveNullAndEmptyArrays: true },
                },
                {
                  $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    author: { $first: '$author' },
                    photo: { $first: '$photo' },
                    color: { $first: '$color' },
                    created: { $first: '$created' },
                    links: { $first: '$links' },
                  },
                },
                {
                  $addFields: {
                    linksCount: { $size: '$links' },
                  },
                },
                {
                  $project: { 'author.salt': 0,
                    usersSaved: 0,
                    'author._id': 0,
                    'author.hash': 0,
                    'author.banned': 0,
                    'author.created': 0,
                    'author.accType': 0,
                    'author.createdCollections': 0,
                    'author.savedCollections': 0,
                    'author.savedLinks': 0,
                    'author.addedLinks': 0,
                    'author.__v': 0,
                    links: 0,
                    'tags.__v': 0,
                    'tags.textColor': 0,
                    'tags.color': 0,
                  },
                },
                {
                  $sort: { created: -1 },
                },
              ])
                .then(collections => res.json({ collections }));
            }
            return Link.aggregate([
              {
                $match: { _id: req.params.type === LINKS ? { $in: user.savedLinks.map(id => mongoose.Types.ObjectId(id)) } :
                  { $in: user.addedLinks.map(id => mongoose.Types.ObjectId(id)) } },
              },
              {
                $unwind: { path: '$author', preserveNullAndEmptyArrays: true },
              },
              {
                $lookup:
                   {
                     from: 'users',
                     localField: 'userAdded',
                     foreignField: 'userId',
                     as: 'userAdded',
                   },
              },
              {
                $unwind: { path: '$userAdded', preserveNullAndEmptyArrays: true },
              },
              {
                $project: { __v: 0,
                  usersSaved: 0,
                  'userAdded.salt': 0,
                  'userAdded._id': 0,
                  'userAdded.hash': 0,
                  'userAdded.banned': 0,
                  'userAdded.created': 0,
                  'userAdded.accType': 0,
                  'userAdded.createdCollections': 0,
                  'userAdded.savedCollections': 0,
                  'userAdded.savedLinks': 0,
                  'userAdded.addedLinks': 0,
                  'userAdded.__v': 0,
                },
              },
            ])
              .then(links => res.json({ links }));
          } else if (req.method === 'DELETE' && myTypes.indexOf(req.params.type) !== -1) {
            return mongoCollection.findOneAndRemove(req.params.type === MY_COLLECTIONS ?
              { _id: mongoose.Types.ObjectId(req.params.id), authorId: req.user.userId } :
              { _id: mongoose.Types.ObjectId(req.params.id), userAdded: req.user.userId })
              .then((deletedContent) => {
                if (!deletedContent) {
                  throw new error.NotFound('CONTENT_DELETE_ERR', 'Nothing to delete');
                }
                res.json({ result: 'successfully deleted' });
              });
          }
          return res.json({ result: 'success' });
        });
    })
    .catch(err => next(err));
});

module.exports = router;
