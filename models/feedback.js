const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  subject: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
  },
  authorStringName: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('feedbacks', schema);
