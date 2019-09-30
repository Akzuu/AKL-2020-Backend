const mongoose = require('mongoose');
const brcrypt = require('bcrypt');
const { log } = require('../lib');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  userName: {
    type: String,
    min: 1,
    required: true,
    unique: true,
  },
  generalInfo: {
    firstName: {
      type: String,
    },
    surname: {
      type: String,
    },
    age: {
      type: Number,
    },
    guild: {
      type: String,
    },
    university: {
      type: String,
      required: true,
    },
  },
  email: {
    // TODO: Validation
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  currentTeam: {
    type: ObjectId,
    ref: 'teams',
  },
  previousTeams: [{
    type: ObjectId,
    ref: 'teams',
  }],
  steam: {
    steamID: {
      type: String,
      required: true,
      unique: true,
    },
    steamID64: {
      type: String,
      required: true,
      unique: true,
    },
  },
}, {
  timestamps: true,
});

// Hash passwords before saving them
schema.pre('save', function preSave(next) {
  const saltRounds = 10;
  brcrypt.hash(this.passwordHash, saltRounds, (err, hash) => {
    if (err) {
      log.error('Not able to save user! Password hash failed! ', err);
      next(new Error('Not able to save user!'));
    }

    this.passwordHash = hash;
    next();
  });
});

module.exports = mongoose.model('users', schema);
