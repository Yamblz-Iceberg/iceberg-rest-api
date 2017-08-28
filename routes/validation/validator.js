const validation = require('express-validation');

validation.options({
  status: 400,
  statusText: 'Bad Request',
  contextRequest: true,
  allowUnknownBody: false,
});

module.exports = validation;
