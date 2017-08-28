const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('mongoose-find-or-create');

const Schema = mongoose.Schema;

const Collection = new Schema({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
  },
  photo: {
    type: String,
  },
  links: {
    type: Array,
  },
  color: {
    type: String,
    required: true,
  },
  textColor: {
    type: String,
    required: true,
  },
});

Collection.plugin(findOrCreate);

module.exports.Collection = mongoose.model('Collection', Collection);
