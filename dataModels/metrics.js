const mongoose = require('../libs/db/mongoose');

const Schema = mongoose.Schema;

const Metrcic = new Schema({
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ['link', 'collection'],
  },
  opened: {
    type: Boolean,
    default: false,
  },
  openTime: {
    type: Date,
    default: Date.now,
  },
});


module.exports = Metrcic;
