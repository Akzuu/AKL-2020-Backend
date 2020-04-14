const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  seasonName: {
    type: String,
    required: true,
  },
  seasonNumber: {
    type: Number,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  informationText: {
    type: String,
  },
  teams: [{
    type: ObjectId,
    ref: 'teams',
  }],
  applications: [{
    applicationText: {
      type: String,
      required: true,
    },
    team: {
      type: ObjectId,
      ref: 'teams',
      required: true,
    },
  }],
  year: {
    type: Number,
    required: true,
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false,
  },
  challongeURI: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('seasons', schema);
