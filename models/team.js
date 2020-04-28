const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  teamName: {
    type: String,
    min: 3,
    required: true,
    trim: true,
    unique: true,
  },
  abbreviation: {
    type: String,
    min: 1,
    max: 11,
    required: true,
    unique: true,
  },
  introductionText: {
    type: String,
    required: true,
  },
  captain: {
    type: ObjectId,
    ref: 'users',
    required: true,
  },
  members: [{
    type: ObjectId,
    ref: 'users',
  }],
  applications: [{
    applicationText: {
      type: String,
    },
    user: {
      type: ObjectId,
      ref: 'users',
      required: true,
    },
  }],
  seasons: [{
    type: ObjectId,
    ref: 'seasons',
  }],
  hidden: {
    type: Boolean,
    required: true,
    default: false,
  },
  rank: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('teams', schema);
