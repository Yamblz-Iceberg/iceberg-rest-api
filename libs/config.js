const nconf = require('nconf');
const cryptoJSON = require('crypto-json');
const configEncrypted = require('../config_secret_enc.json');

const root = process.cwd();


if (process.env.CONFIG_ENCRYPTION_KEY) {
  const decrypted = cryptoJSON.decrypt(configEncrypted, process.env.CONFIG_ENCRYPTION_KEY, {
    algorithm: 'camellia-128-cbc',
    encoding: 'base64',
  });
  nconf.add('secret', {
    type: 'literal',
    store: decrypted,
  });
} else {
  nconf.add('secret', {
    type: 'file',
    file: `${root}/config_secret.json`,
  });
}

nconf.add('global', {
  type: 'file',
  file: `${root}/config.json`,
});

module.exports = nconf;
