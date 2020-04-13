const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  teamName: {
    type: String,
    min: 3,
    required: true,
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
    enum: [
      'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
      'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
      'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
      'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
      'Supreme Master First Class', 'Global Elite'],
  },
});

module.exports = mongoose.model('teams', schema);
