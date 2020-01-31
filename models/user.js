const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { log } = require('../lib');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  userName: {
    type: String,
    min: 3,
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
  password: {
    type: String,
    required: true,
    min: 8,
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
  avatar: {
    type: Buffer,
  },
  tokens: [{
    token: {
      type: String,
    },
  }],
}, {
  timestamps: true,
});

// Hash passwords before saving them
schema.pre('save', function preSave(next) {
  const saltRounds = 10;
  bcrypt.hash(this.password, saltRounds, (err, hash) => {
    if (err) {
      log.error('Not able to save user! Password hash failed! ', err);
      next(new Error('Not able to save user!'));
    }

    this.password = hash;
    next();
  });
});

module.exports = mongoose.model('users', schema);
