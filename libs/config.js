const nconf = require('nconf');

const root = process.cwd();

nconf.add('global', {
  type: 'file',
  file: `${root}/config.json`,
});
nconf.add('secret', {
  type: 'file',
  file: `${root}/config_secret.json`,
});


module.exports = nconf;
