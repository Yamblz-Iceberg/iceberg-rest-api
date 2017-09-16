const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const Bookmark = new Schema({
  bookmarkId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ['addedLinks', 'createdCollections', 'savedLinks', 'savedCollections', 'personalTags'],
  },
  addTime: {
    type: Date,
    default: Date.now,
  },
  counter: {
    type: Number,
  },
});


module.exports = Bookmark;
