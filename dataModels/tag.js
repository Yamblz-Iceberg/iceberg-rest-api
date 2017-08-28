const mongoose = require('../libs/db/mongoose');
const findOrCreate = require('mongoose-find-or-create');

const Schema = mongoose.Schema;

const Tag = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
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

Tag.plugin(findOrCreate);

module.exports.Tag = mongoose.model('Tag', Tag);
