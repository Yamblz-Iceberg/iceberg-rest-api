const cryptoJSON = require('crypto-json');
const fs = require('fs');
const config = require('./config');
const log = require('./log/log')(module);

const root = process.cwd();
const configFile = require('../config_secret.json');
const googleCredentials = require('../google-credentials.json');

const encryptFile = (inputFile, key, outputFile) => new Promise((resolve, reject) => {
  try {
    const error = new Error();
    error.name = 'ENCRYPT_JSON_ERR';

    if (!inputFile || typeof inputFile !== 'object') {
      error.message = 'No input file provided';
      throw error;
    }
    if (!key || typeof key !== 'string') {
      error.message = 'No key provided';
      throw error;
    }
    if (!outputFile || typeof outputFile !== 'string') {
      error.message = 'No output path provided';
      throw error;
    }
    const encryptedConfig = cryptoJSON.encrypt(inputFile, key, {
      algorithm: 'camellia-128-cbc',
      encoding: 'base64',
    });
    const outputFilePath = `${root}/${outputFile}`;
    fs.writeFile(outputFilePath, JSON.stringify(encryptedConfig, null, 2), 'utf-8', (err) => {
      if (err) {
        reject(err);
      }
      resolve(`File was encrypted and saved at: ${outputFilePath}`);
    });
  } catch (err) {
    reject(err);
  }
});

const passKey = process.env.CONFIG_ENCRYPTION_KEY || config.get('encryptKey');

log.info('Creating secure configs for deployment, or pushing GitHub');

encryptFile(configFile, passKey, 'config_secret_enc.json')
  .then(message => log.info(message))
  .then(() => encryptFile(googleCredentials, passKey, 'google-credentials_enc.json'))
  .then(message => log.info(message))
  .catch(err => log.error(err));

module.exports.encryptFile = encryptFile;
