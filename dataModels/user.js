const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('findorcreate-promise');
const passportLocalMongoose = require('passport-local-mongoose');
const Bookmark = require('./bookmark');
const Metric = require('./metrics');

const Schema = mongoose.Schema;

const User = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
  },
  accType: {
    type: String,
    enum: ['user', 'demo'],
    default: 'user',
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  bookmarks: {
    type: [Bookmark],
  },
  metrics: {
    type: [Metric],
  },
  photo: {
    type: String,
  },
  sex: {
    type: String,
  },
  socialLink: {
    type: String,
  },
  rating: {
    type: Number,
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

User.plugin(findOrCreate);
User.plugin(passportLocalMongoose, {
  usernameField: 'userId',
});

module.exports.User = mongoose.model('User', User);
