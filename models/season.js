const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  informationText: {
    type: String,
  },
  teams: [{
    type: ObjectId,
    ref: 'teams',
  }],
  applications: [{
    type: ObjectId,
    ref: 'teams',
  }],
  year: {
    type: Number,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('seasons', schema);
