const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  name: {
    type: String,
    min: 1,
    required: true,
    unique: true,
  },
  introductionText: {
    type: String,
    required: true,
  },
  captain: {
    type: ObjectId,
    ref: 'user',
    required: true,
  },
  members: [{
    type: ObjectId,
    ref: 'user',
  }],
  seasons: [{
    type: ObjectId,
    ref: 'season',
  }],
  active: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('teams', schema);
