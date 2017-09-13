global.Promise = require('bluebird');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override');
const errorHandler = require('./libs/error');
const cors = require('cors');

const RateLimit = require('express-rate-limit');


const limiter = new RateLimit({
  windowMs: 10 * 60 * 1000, //  10 minutes 
  max: 100, 
  delayMs: 0,
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
require('./libs/auth/yandex');


const users = require('./routes/users');
const index = require('./routes/index');
const collections = require('./routes/collections');
const register = require('./routes/register');
const feed = require('./routes/feed');
const tags = require('./routes/tags');
const upload = require('./routes/upload');
const links = require('./routes/links');
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
app.use(helmet({
  frameguard: false,
}));
// app.use(limiter);

app.use('/', index);
app.use('/users', users);
app.use('/register', register);
app.use('/oauth', oauth);
app.use('/feed', feed);
app.use('/collections', collections);
app.use('/tags', tags);
app.use('/upload', upload);
app.use('/links', links);


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
        code: 'ERROR_PARSE_ERR',
        type: 'API_ERROR',
        message: 'This message is caused by bad error data, this usually doesn\'t happens, but this error must be defined 🙃',
      });
      next(error);
    });
});

module.exports = app;

