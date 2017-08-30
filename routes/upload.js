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
const ColorThief = require('color-thief');
const Jimp = require('jimp');

const root = process.cwd();

const getImageBuffer = (image, mime) => new Promise((resolve, reject) => {
  image.getBuffer(mime, (err, buffer) => {
    if (err) {
      reject(err)
    }
    return resolve(buffer);
  }
)
});


router.post('/', (req, res, next) => {
  if (!req.files) {
    return next(new error.BadRequest('NO_FILE_ERR', 'Nothing to upload'));
  }

  const sampleFile = req.files.photo;
  const fileName = `${uuidv4()}.${mime.extension(sampleFile.mimetype)}`;
  const fileUri = `${root}/public/images/${fileName}`;
  const colorThief = new ColorThief();

  return sampleFile.mv(fileUri)
    .then(() => Jimp.read(fileUri))
    .then(image => getImageBuffer(image, sampleFile.mimetype))
    .then(image => res.json({ fileName, mainColor: `rgb(${colorThief.getColor(image).join(', ')})` }))
    .catch(err => next(new error.InternalServerError('FILE_SAVE_ERR', err)));
});


module.exports = router;
