const express = require('express');

const router = express.Router();

const passport = require('passport');

const User = require('.././dataModels/user').User;
const Collection = require('.././dataModels/collection').Collection;
const Tag = require('.././dataModels/tag').Tag;
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');

const _ = require('lodash');

router.get('/', validation(validationParams.feed), passport.authenticate('bearer', { session: false }), (req, res, next) => {
  Collection.aggregate([
    {
      $match: req.query.search && !/^#/.test(req.query.search) ?
        { name: { $regex: new RegExp(req.query.search, 'i') } } : { _id: { $exists: true } },
    },
    {
      $unwind: { path: '$links', preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: '$tags', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup:
         {
           from: 'tags',
           localField: 'tags',
           foreignField: '_id',
           as: 'tag',
         },
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
      $unwind: { path: '$tag', preserveNullAndEmptyArrays: true },
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
        links: { $addToSet: '$links' },
        tags: { $addToSet: '$tag' },
        usersSaved: { $first: '$usersSaved' },
      },
    },
    {
      $match: req.query.search && /^#/.test(req.query.search) ?
        { 'tags.name': { $regex: new RegExp(req.query.search.replace('#', ''), 'i') } } : { _id: { $exists: true } },
    },
    {
      $addFields: {
        // tags: { $slice: ['$tags', 2] },
        linksCount: { $size: '$links' },
        savedTimesCount: { $size: '$usersSaved' },
        saved: { $cond: { if: { $and: [{ $isArray: '$usersSaved' }, { $in: [req.user.userId, '$usersSaved'] }] }, then: true, else: false } },
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
      $sort: req.query.sort === 'time' ? { created: -1 } : { savedTimesCount: -1 },
    },
  ])
    .then((collections) => {
      if (!collections) {
        throw new error.NotFound('NO_COLLECTIONS_ERR', 'Collections cannot be found');
      } else {
        if (req.query.only === 'collections') {
          return res.json({ collections: collections.slice(0, req.query.count ? req.query.count : collections.length) });
        }
        return Tag.find(req.query.search ? { name: { $regex: new RegExp(req.query.search.replace('#', ''), 'i') } } : {}, { __v: 0 })
          .then((tags) => {
            if (!tags) {
              throw new error.NotFound('NO_TAGS_ERR', 'Tags not found');
            }
            res.json({ collections: !req.query.only ? collections.slice(0, req.query.count ? req.query.count : collections.length) : undefined,
              tags: req.query.only === 'tags' || !req.query.only ? tags.slice(0, req.query.count ? req.query.count : tags.length) : undefined });
          });
      }
    })
    .catch(err => next(err));
});

module.exports = router;
