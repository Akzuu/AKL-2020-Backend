const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  seasonName: {
    type: String,
    required: true,
    trim: true,
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

schema.index({
  seasonName: 1,
  seasonNumber: 1,
  division: 1,
  year: 1,
}, {
  unique: true,
});

module.exports = mongoose.model('seasons', schema);
