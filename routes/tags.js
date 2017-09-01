const express = require('express');

const router = express.Router();

const passport = require('passport');

const Tag = require('.././dataModels/tag').Tag;
const mongoose = require('mongoose');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');

const _ = require('lodash');

router.post('/:tagName', validation(validationParams.tag), passport.authenticate('bearer', { session: false }), (req, res, next) => {
  Tag.findOrCreate({ name: req.params.tagName })
    .then(tag => res.json({ tag }))
    .catch(err => next(err));
});


module.exports = router;
