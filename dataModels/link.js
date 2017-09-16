const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('findorcreate-promise');

const Schema = mongoose.Schema;

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
  },
  photo: {
    type: String,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  added: {
    type: Date,
    default: Date.now,
  },
  usersSaved: {
    type: Array,
  },
  usersLiked: {
    type: Array,
  },
});

Link.plugin(findOrCreate);

module.exports.Link = mongoose.model('Link', Link);
