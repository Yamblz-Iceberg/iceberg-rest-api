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

router.get('/', (req, res, next) => {
  Collection.aggregate([
    {
      $unwind: '$links',
    },
    {
      $unwind: '$tags',
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
      $unwind: '$tag',
    },
    {
      $unwind: '$author',
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        author: { $first: '$author' },
        photo: { $first: '$photo' },
        color: { $first: '$color' },
        links: { $addToSet: '$links' },
        tags: { $addToSet: '$tag' },
      },
    },
    {
      $addFields: {
        tags: { $slice: ['$tags', 2] },
        links: { $size: '$links' },
      },
    },
    {
      $project: { 'author.salt': 0,
        'author._id': 0,
        'author.hash': 0,
        'author.banned': 0,
        'author.created': 0,
        'author.rating': 0,
        'author.accType': 0,
        'author.__v': 0,
        'links.__v': 0,
        'tags.__v': 0,
        'tags.textColor': 0,
        'tags.color': 0,
      },
    },
  ])
    .then((collections) => {
      if (!collections) {
        throw new error.NotFound('NO_COLLECTIONS', 'Collections cannot be found');
      } else {
        return Tag.find({}, { __v: 0 })
          .then((tags) => {
            if (!tags) {
              throw new error.NotFound('NO_TAGS', 'Tags cannot be found');
            }
            res.json({ collections, tags });
          });
      }
    })
    .catch(err => next(err));
});

module.exports = router;
