const error = require('rest-api-errors');

const accountTypeMiddleware = (req, res, next) => {
  if (req.user.accType === 'demo') {
    throw next(new error.MethodNotAllowed('AUTH_ERROR_DEMO', 'Upgrade your account to full'));
  }
  return next();
};

const isBlocked = (user, next, info) => {
  if (user.banned) {
    throw next(new error.Forbidden('AUTH_ERROR_BANNED', 'Account is banned here'));
  } else {
    if (info) {
      return next(null, user, info);
    }
    return next(null, user);
  }
};

module.exports.accountTypeMiddleware = accountTypeMiddleware;
module.exports.isBlocked = isBlocked;
