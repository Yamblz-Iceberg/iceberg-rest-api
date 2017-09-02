const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('findorcreate-promise');

const Schema = mongoose.Schema;

// TODO: category link
const Link = new Schema({
  name: {
    type: String,
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
  },
  description: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  usersSaved: {
    type: Array,
  },
});

Link.plugin(findOrCreate);

module.exports.Link = mongoose.model('Link', Link);
