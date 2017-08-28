const winston = require('winston');

winston.emitErrs = true;

function logger(module) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: 'debug',
        label: getFilePath(module),
        handleException: true,
        json: false,
        colorize: true,
      }),
    ],
    exitOnError: false,
  });
}

function getFilePath(module) {
  return module.filename.split('/').slice(-2).join('/');
}

module.exports = logger;
