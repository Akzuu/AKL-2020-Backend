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
  game: {
    type: String,
    required: true,
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false,
  },
  acceptsParticipants: {
    type: Boolean,
    required: true,
    default: true,
  },
  seasonEnded: {
    type: Boolean,
    default: false,
  },
  maximumParticipants: {
    type: Number,
  },
  challonge: {
    URI: {
      type: String,
    },
    tournamentID: {
      type: String,
    },
    subdomain: {
      type: String,
    },
    twoStageTournament: {
      type: Boolean,
      default: false,
    },
    groupStageTournamentType: {
      type: String,
      enum: ['single elimination', 'double elimination', 'round robin'],
      default: 'round robin',
    },
    groupSize: {
      type: Number,
      default: 4,
      min: 2,
      max: 20,
    },
    groupAdvance: {
      type: Number,
      default: 2,
      min: 1,
      max: 20,
    },
    groupRankBy: {
      type: String,
      enum: ['match wins', 'points scored', 'points difference'],
      default: 'match wins',
    },
    finalStageTournamentType: {
      type: String,
      enum: ['single elimination', 'double elimination', 'round robin', 'swiss'],
      default: 'single elimination',
    },
    finalStageIncludeMatchForThird: {
      type: Boolean,
      default: false,
    },
    finalStageSwissRounds: {
      type: Number,
    },
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
