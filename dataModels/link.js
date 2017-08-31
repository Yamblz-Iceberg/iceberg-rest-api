const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('mongoose-find-or-create');

const Schema = mongoose.Schema;

// TODO: category link
const Link = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  userAdded: {
    type: String,
    required: true,
  },
  favicon: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  savedTimesCount: {
    type: Number,
    default: 0,
  },
});

Link.plugin(findOrCreate);

module.exports.Link = mongoose.model('Link', Link);
