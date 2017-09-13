const cryptoJSON = require('crypto-json');
const fs = require('fs');
const config = require('./config');
const log = require('./log/log')(module);

const root = process.cwd();
const configFile = require('../config_secret.json');
const googleCredentials = require('../google-credentials');

const passKey = process.env.CONFIG_ENCRYPTION_KEY || config.get('encryptKey');

const encryptedConfig = cryptoJSON.encrypt(configFile, passKey, {
  algorithm: 'camellia-128-cbc',
  encoding: 'hex',
});

const encryptedgoogleCredentials = cryptoJSON.encrypt(googleCredentials, passKey, {
  algorithm: 'camellia-128-cbc',
  encoding: 'hex',
});
log.info('Creating secure configs for deployment, or pushing GitHub');

fs.writeFile(`${root}/config_secret_enc.json`, JSON.stringify(encryptedConfig, null, 2), 'utf-8', (err0) => {
  if (err0) {
    return log.err(err0);
  }
  return fs.writeFile(`${root}/google-credentials_enc.json`, JSON.stringify(encryptedgoogleCredentials, null, 2), 'utf-8', (err1) => {
    if (err1) {
      return log.err(err1);
    }
    return log.info('files created');
  });
});
