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
  time: {
    type: Date,
    default: Date.now,
  },
});


module.exports = Bookmark;
