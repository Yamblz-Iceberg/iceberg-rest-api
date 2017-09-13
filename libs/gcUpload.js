const mime = require('mime-types');
const uuidv4 = require('uuid');
const error = require('rest-api-errors');
const KEY_FILE = require('../google-credentials_enc');

const PROJECT_ID = 'iceberg-cfa80';
const CLOUD_BUCKET = `${PROJECT_ID}.appspot.com`;
const config = require('./config');
const cryptoJSON = require('crypto-json');
const GCS = require('@google-cloud/storage');


const passKey = process.env.CONFIG_ENCRYPTION_KEY || config.get('encryptKey');
const DECRYPTED_KEY_OBJECT = cryptoJSON.decrypt(KEY_FILE, passKey, {
  algorithm: 'camellia-128-cbc',
  encoding: 'hex',
});

const gcs = new GCS({
  projectId: PROJECT_ID,
  credentials: DECRYPTED_KEY_OBJECT,
});

const bucket = gcs.bucket(CLOUD_BUCKET);

const getPublicUrl = filename => `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;

const sendUploadToGCS = (fileSrc, prefix = '') => new Promise((resolve, reject) => {
  if (!fileSrc) {
    reject(new error.BadRequest('NO_FILE_ERR', 'File not found'));
  }
  const name = uuidv4();
  const gcsname = `images/${name + prefix}.${mime.extension(fileSrc.mimetype)}`;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: fileSrc.mimetype,
    },
  });

  stream.on('error', (err) => {
    reject(new error.BandwidthLimitExceeded('GC_UPLOAD_ERR', err.message));
  });

  stream.on('finish', () => {
    file.makePublic().then(() => {
      resolve(getPublicUrl(gcsname));
    });
  });

  stream.end(fileSrc.buffer);
});

module.exports.upload = sendUploadToGCS;
