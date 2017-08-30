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
const KEY_FILENAME = 'iceberg-cfa80-firebase-adminsdk-2ftak-c8bba566d7.json';
const PROJECT_ID = 'iceberg-cfa80';
const CLOUD_BUCKET = `${PROJECT_ID}.appspot.com`;

const gcs = require('@google-cloud/storage')({
  projectId: root + PROJECT_ID,
  keyFilename: KEY_FILENAME,
});

const bucket = gcs.bucket(CLOUD_BUCKET);


function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/images/${filename}`;
}

function sendUploadToGCS(req, res, next) {
  if (!req.files) {
    return next();
  }

  const sampleFile = req.files.photo;
  const gcsname = `${uuidv4()}.${mime.extension(sampleFile.mimetype)}`;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: sampleFile.mimetype,
    },
  });

  stream.on('error', (err) => {
    req.files.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.files.cloudStorageObject = gcsname;
    req.files.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.files.buffer);
}


const getImageBuffer = (image, imageMime) => new Promise((resolve, reject) => {
  image.getBuffer(imageMime, (err, buffer) => {
    if (err) {
      reject(err);
    }
    return resolve(buffer);
  });
});


router.post('/', sendUploadToGCS, (req, res, next) => {
  if (!req.files) {
    return next(new error.BadRequest('NO_FILE_ERR', 'Nothing to upload'));
  }

  const colorThief = new ColorThief();

  // return sampleFile.mv(fileUri)
  //   .then(() => Jimp.read(fileUri))
  //   .then(image => image
  //     .resize(101, 100)
  //     .crop(51, 90, 100, 20))
  //   .then(image => getImageBuffer(image, sampleFile.mimetype))
  /*   .then(image => */ res.json({ fileName: req.files.cloudStoragePublicUrl, mainColor: `rgb(${colorThief.getColor(req.files.buffer).join(', ')})` }); // )
  // catch(err => next(new error.InternalServerError('FILE_SAVE_ERR', err)));
});


module.exports = router;
