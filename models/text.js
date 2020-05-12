const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  title: {
    type: String,
    required: true,
  },
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
    ref: 'users',
    required: true,
  },
  hiddenUntil: {
    type: Date,
    required: true,
  },
  comments: [{
    type: ObjectId,
    ref: 'comments',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('texts', schema);
