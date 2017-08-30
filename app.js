global.Promise = require('bluebird');
const express = require('express');
const socketIo = require('socket.io');
const helmet = require('helmet');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
// const config = require('./libs/config');
const passport = require('passport');
const methodOverride = require('method-override');
const errorHandler = require('./libs/error');
const cors = require('cors');

const RateLimit = require('express-rate-limit');

// TODO: bruttforce

const limiter = new RateLimit({
  windowMs: 10 * 60 * 1000, //  10 minutes 
  max: 100, // limit each IP to 100 requests per windowMs 
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  statusCode: 429,
  message: 'too fast bro',
  handler(req, res, next) {
    return next;
  },
  keyGenerator(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});


const app = express();

require('./libs/auth/auth');
require('./libs/auth/vk');
require('./libs/auth/facebook');

const io = socketIo();
app.io = io;
require('./libs/websocket/socketIO')(io);


const index = require('./routes/index');
const users = require('./routes/users');
const collections = require('./routes/collections');
const register = require('./routes/register');
const feed = require('./routes/feed');
const tags = require('./routes/tags');
const upload = require('./routes/upload');
require('./libs/db/mongoose');
require('./libs/auth/oauth2');
const oauth = require('./routes/oauth');
require('./libs/log/log')(module);

//  view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('json spaces', 2);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(passport.initialize());
app.use(helmet());
app.use(limiter);

// FIXME: Redirect to https 
// app.all('*', ensureSecure);

// function ensureSecure(req, res, next) {
//   if (req.secure) {
//     return next();
//   }
//   return res.redirect(`https:// localhost.daplie.me:3001${req.url}`);
// }

app.use('/', index);
app.use('/users', users);
app.use('/register', register);
app.use('/oauth', oauth);
app.use('/feed', feed);
app.use('/collections', collections);
app.use('/tags', tags);
app.use('/upload', upload);


//  catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  err.code = 'NO_ROUTE_ERR';
  next(err);
});

app.use((err, req, res, next) => {
  errorHandler(err)
    .then((message) => {
      res.status(err.status || 500).end(message);
      return req.app.get('env') === 'production' ? next() : next(err);
    })
    .catch((error) => {
      res.status(500).json({
        code: 'ERROR_PARSE_ERROR',
        type: 'API_ERROR',
        message: 'This message is caused by illegal error data, this literaly doesn\'t happens, but this error must be defined',
      });
      next(error);
    });
});

module.exports = app;

