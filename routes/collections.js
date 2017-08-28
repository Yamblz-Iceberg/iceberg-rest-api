const express = require('express');

const router = express.Router();

const passport = require('passport');

const Collection = require('.././dataModels/collection').Collection;
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');

const _ = require('lodash');

router.get('/:collectionId', (req, res, next) => {
  Collection.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(req.params.collectionId) },
    },
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
      $lookup:
         {
           from: 'links',
           localField: 'links',
           foreignField: '_id',
           as: 'link',
         },
    },
    {
      $unwind: '$tag',
    },
    {
      $unwind: '$link',
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
        links: { $addToSet: '$link' },
        tags: { $addToSet: '$tag' },
      },
    },
    {
      $addFields: {
        tags: { $slice: ['$tags', 2] },
      },
    },
    {
      $project: { 'author.salt': 0,
        'author._id': 0,
        'author.hash': 0,
        'author.banned': 0,
        'author.created': 0,
        'author.__v': 0,
        'links.__v': 0,
        'tags.__v': 0,
      },
    },
  ])
    .then((collection) => {
      if (!collection || !collection.length) {
        throw new error.NotFound('NO_COLLECTIONS', 'Collections not found');
      } else {
        res.json({ collection });
      }
    })
    .catch(err => next(err));
});

module.exports = router;
