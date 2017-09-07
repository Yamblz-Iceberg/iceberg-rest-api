const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const Bookmark = new Schema({
  bookmarkId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  opened: {
    type: Boolean,
    default: false,
  },
  addTime: {
    type: Date,
    default: Date.now,
  },
  openTime: {
    type: Date,
  },
  counter: {
    type: Number,
    default: 0,
  },
});


module.exports = Bookmark;
