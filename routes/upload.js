const express = require('express');

const router = express.Router();

const passport = require('passport');

const Tag = require('.././dataModels/tag').Tag;
const mongoose = require('mongoose');
const uuidv4 = require('uuid');

const validation = require('./validation/validator');
const validationParams = require('./validation/params');
const error = require('rest-api-errors');

const _ = require('lodash');
const mime = require('mime-types');

const root = process.cwd();

router.post('/', (req, res, next) => {
  if (!req.files) {
    return next(new error.BadRequest('NO_FILE_ERR', 'Nothing to upload'));
  }

  const sampleFile = req.files.photo;
  const fileName = `${uuidv4()}.${mime.extension(sampleFile.mimetype)}`;

  return sampleFile.mv(`${root}/public/images/${fileName}`)
    .then(() => res.json({ fileName }))
    .catch(err => next(new error.InternalServerError('FILE_SAVE_ERR', err)));
});


module.exports = router;
