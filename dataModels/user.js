const mongoose = require('../libs/db/mongoose');
// const crypto = require('crypto');
const findOrCreate = require('findorcreate-promise');
const passportLocalMongoose = require('passport-local-mongoose');
const Bookmark = require('./bookmark');

const Schema = mongoose.Schema;

const User = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
  },
  accType: {
    type: String,
    required: false,
    enum: ['user', 'demo'],
    default: 'user',
  },
  firstName: {
    type: String,
    unique: false,
    required: false,
  },
  lastName: {
    type: String,
    unique: false,
    required: false,
  },
  savedLinks: {
    type: [Bookmark],
  },
  addedLinks: {
    type: [Bookmark],
  },
  savedCollections: {
    type: [Bookmark],
  },
  createdCollections: {
    type: [Bookmark],
  },
  personalTags: {
    type: [Bookmark],
  },
  photo: {
    type: String,
    required: false,
  },
  sex: {
    type: String,
  },
  socialLink: {
    type: String,
  },
  rating: {
    type: Number,
    required: false,
    default: 5,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  vkToken: {
    type: String,
  },
  fbToken: {
    type: String,
  },
  yaToken: {
    type: String,
  },
  banned: {
    type: Boolean,
    required: true,
    default: false,
  },
});
// TODO: переделать userId на id монго
User.plugin(findOrCreate);
User.plugin(passportLocalMongoose, {
  usernameField: 'userId',
});

module.exports.User = mongoose.model('User', User);
