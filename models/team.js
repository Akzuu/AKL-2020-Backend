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
    required: true,
  },
  introductionText: {
    type: String,
    required: true,
  },
  applicationText: {
    type: String,
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
