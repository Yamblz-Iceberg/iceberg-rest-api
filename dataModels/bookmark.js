const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const Bookmark = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
});


module.exports = Bookmark;
