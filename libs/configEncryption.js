const cryptoJSON = require('crypto-json');
const fs = require('fs');
const config = require('./config');
const log = require('./log/log')(module);

const root = process.cwd();
const configFile = require('../config_secret.json');
const googleCredentials = require('../google-credentials.json');

const encryptFile = (inputFile, key, outputFile) => new Promise((resolve, reject) => {
  if (!inputFile || typeof key !== 'object') {
    reject(new Error('No input file provided'));
  }
  if (!key || typeof key !== 'string') {
    reject(new Error('No key provided'));
  }
  if (!outputFile || typeof key !== 'string') {
    reject(new Error('No output path provided'));
  }
  try {
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
