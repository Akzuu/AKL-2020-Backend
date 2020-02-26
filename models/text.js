const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  location: {
    type: String,
    required: true,
  },
  fiText: {
    type: String,
    required: true,
  },
  enText: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('texts', schema);
