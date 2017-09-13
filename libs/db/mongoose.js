const mongoose = require('mongoose');
const config = require('../config');


if (process.env.NODE_ENV === 'test') {
  mongoose.connection = mongoose.createConnection(process.env.MONGODB_URI_TEST || config.get('mongoose:uri_test'));
} else if (process.env.MONGODB_URI) {
  mongoose.connection = mongoose.createConnection(config.get('mongodb_uri') || process.env.MONGODB_URI);
} else {
  mongoose.connection = mongoose.createConnection(config.get('mongoose:uri'));
}
mongoose.Promise = global.Promise;

module.exports = mongoose;
