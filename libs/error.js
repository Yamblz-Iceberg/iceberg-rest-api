const expressValidationError = require('express-validation').ValidationError;
const restError = require('rest-api-errors').APIError;
const FBError = require('fb').FacebookApiException;
const VKAPIError = require('node-vkapi/lib/errors/api-error');
const VKAuthError = require('node-vkapi/lib/errors/auth-error');
const passportLocalMongooseErr = require('passport-local-mongoose/lib/errors').AuthenticationError;

const errorHandler = error => new Promise((resolve, reject) => {
  try {
    const body = {
      code: error.code,
    };

    if (error instanceof expressValidationError) {
      body.type = 'VALIDATION_ERROR';
      body.message = error.errors;
    } else if (error instanceof FBError) {
      const fbErrorObject = JSON.parse(error.message);
      body.type = 'FB_API_ERROR';
      body.code = fbErrorObject.error.code;
      body.message = fbErrorObject.error.message;
    } else if (error instanceof VKAPIError) {
      body.type = 'VK_API_ERROR';
      body.message = error.message;
    } else if (error instanceof VKAuthError) {
      body.type = 'VK_AUTH_ERROR';
      body.message = error.message;
    } else if (error instanceof restError) {
      body.type = 'API_ERROR';
      body.message = error.message;
    } else if (error instanceof passportLocalMongooseErr) {
      body.type = 'REGISTRATION_ERROR';
      body.message = error.message;
    } else if (error.name === 'MongoError') {
      body.type = 'MONGO_ERROR';
      body.message = error.message;
    } else if (error.code) {
      body.type = 'DB_ERROR';
      body.message = error.message;
    } else {
      body.type = 'API_ERROR';
      body.code = 'UNKNOWN_ERR_CODE';
      body.message = error.message;
    }

    resolve(JSON.stringify(body));
  } catch (err) {
    reject(err);
  }
});

module.exports = errorHandler;

