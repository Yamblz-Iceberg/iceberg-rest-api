const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const Client = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  clientId: {
    type: String,
    unique: true,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
});

module.exports.Client = mongoose.model('Client', Client);
