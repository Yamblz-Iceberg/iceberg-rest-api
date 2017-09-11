const express = require('express');

const router = express.Router();

const passport = require('passport');

const Collection = require('.././dataModels/collection').Collection;
const Tag = require('.././dataModels/tag').Tag;

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');


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
      $lookup:
         {
           from: 'users',
           localField: 'tag._id',
           foreignField: 'bookmarks.bookmarkId',
           as: 'tagRel',
         },
    },
    {
      $unwind: { path: '$tagRel', preserveNullAndEmptyArrays: true },
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
        tagRel: { $addToSet: '$tagRel' },
        usersSaved: { $first: '$usersSaved' },
        closed: { $first: '$closed' },
      },
    },
    { $addFields: { tagRel: {
      $filter: {
        input: '$tagRel',
        as: 'tag',
        cond: { $and: [{ $eq: ['$$tag.userId', req.user.userId ] }] },
      } } },
    },
    { $addFields: { tagRel: '$tagRel.bookmarks' },
    },
    {
      $unwind: { path: '$tagRel', preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: { tagsClear: {
        $map:
               {
                 input: '$tags',
                 as: 'tag',
                 in: '$$tag._id',
               },
      } },
    },
    { $addFields: { tagRel: {
      $filter: {
        input: '$tagRel',
        as: 'tag',
        cond: { $and: [{ $eq: ['$$tag.type', 'personalTags'] }, { $in: ['$$tag.bookmarkId', '$tagsClear'] }] },
      } } },
    },
    {
      $addFields: { personalRating: { $sum: '$tagRel.counter' } },
    },
    {
      $match: req.query.search && /^#/.test(req.query.search) ?
        { 'tags.name': { $regex: new RegExp(req.query.search.replace('#', ''), 'i') } } : { _id: { $exists: true } },
    },
    {
      $addFields: {
        linksCount: { $size: '$links' },
        savedTimesCount: { $size: '$usersSaved' },
        saved: { $cond: { if: { $and: [{ $isArray: '$usersSaved' }, { $in: [req.user.userId, '$usersSaved'] }] }, then: true, else: false } },
      },
    },
    {
      $project: { 'author.salt': 0,
        usersSaved: 0,
        tagRel: 0,
        tagsClear: 0,
        'author._id': 0,
        'author.hash': 0,
        'author.vkToken': 0,
        'author.fbToken': 0,
        'author.yaToken': 0,
        'author.socialLink': 0,
        'author.sex': 0,
        'author.banned': 0,
        'author.created': 0,
        'author.accType': 0,
        'author.bookmarks': 0,
        'author.metrics': 0,
        'author.__v': 0,
        links: 0,
        'tags.__v': 0,
        'tags.textColor': 0,
        'tags.color': 0,
      },
    },
    {
      $match: { $or: [{ closed: false }, { closed: null }] },
    },
    {
      $match: { linksCount: { $gt: 0 } },
    },
    {
      $sort: req.query.sort === 'time' ? { created: -1 } : { personalRating: -1 },
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
