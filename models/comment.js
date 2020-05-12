const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  text: {
    type: ObjectId,
    ref: 'texts',
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    ref: 'users',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('comments', schema);
