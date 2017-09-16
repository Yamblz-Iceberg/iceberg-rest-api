const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const AccessToken = new Schema({
  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    unique: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports.AccessToken = mongoose.model('AccessToken', AccessToken);
