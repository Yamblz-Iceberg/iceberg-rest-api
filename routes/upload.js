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

const Multer = require('multer');

const multer = new Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 5mb
  },
});

const root = process.cwd();
const KEY_FILENAME = '/google-credentials.json';
const PROJECT_ID = 'iceberg-cfa80';
const CLOUD_BUCKET = `${PROJECT_ID}.appspot.com`;

const GCS = require('@google-cloud/storage');

const gcs = new GCS({
  projectId: PROJECT_ID,
  keyFilename: root + KEY_FILENAME,
});

const bucket = gcs.bucket(CLOUD_BUCKET);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

function sendUploadToGCS(req, res, next) {
  if (!req.file) {
    return next(new error.BadRequest('NO_FILE_ERR', 'File not found'));
  }
  const gcsname = `images/${uuidv4()}.${mime.extension(req.file.mimetype)}`;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    return next(new error.BandwidthLimitExceeded('GC_UPLOAD_ERR', err.message));
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      return next();
    });
  });

  return stream.end(req.file.buffer);
}


const getImageBuffer = (image, imageMime) => new Promise((resolve, reject) => {
  image.getBuffer(imageMime, (err, buffer) => {
    if (err) {
      reject(err);
    }
    return resolve(buffer);
  });
});

function resizeImage(req, res, next) {
  if (!req.file) {
    return next(new error.BadRequest('NO_FILE_ERR', 'File not found'));
  }
  return Jimp.read(req.file.buffer)
    .then(image => image
      .resize(Jimp.AUTO, 1000))
    .then(image => getImageBuffer(image, req.file.mimetype))
    .then((buffer) => {
      req.file.buffer = buffer;
      return next();
    });
}

router.post('/', multer.single('photo'), resizeImage, sendUploadToGCS, (req, res, next) => {
  const colorThief = new ColorThief();

  return Jimp.read(req.file.buffer)
    .then(image => image
      .resize(101, 100)
      .crop(51, 90, 100, 20))
    .then(image => getImageBuffer(image, req.file.mimetype))
    .then(buffer => res.json({ fileName: req.file.cloudStoragePublicUrl, mainColor: `rgb(${colorThief.getColor(buffer).join(', ')})` }))
    .catch(err => next(new error.InternalServerError('FILE_POST_PROCCES_ERR', err)));
});


module.exports = router;
