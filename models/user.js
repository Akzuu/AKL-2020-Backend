const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { log } = require('../lib');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
  username: {
    type: String,
    min: 3,
    trim: true,
    unique: true,
    sparse: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  surname: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    trim: true,
  },
  guild: {
    type: String,
    trim: true,
  },
  university: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Error invalid email'],
  },
  password: {
    type: String,
    min: 8,
  },
  currentTeams: [{
    type: ObjectId,
    ref: 'teams',
  }],
  previousTeams: [{
    type: ObjectId,
    ref: 'teams',
  }],
  steam: {
    username: {
      type: String,
    },
    steamID: {
      type: String,
      unique: true,
      sparse: true,
    },
    steamID64: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
  },
  riotGames: {
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    encryptedSummonerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
    },
    rank: {
      type: String,
    },
  },
  registrationComplete: {
    type: Boolean,
    default: false,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  roles: {
    type: Array,
    default: ['unregistered'],
  },
  resetHash: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash passwords before saving them
schema.pre('save', function preSave(next) {
  // If creating account just with the steam data. See lib/create-user-steam.js
  if (!this.password && !this.registrationComplete) {
    next();
  } else {
    const saltRounds = 10;
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
      if (err) {
        log.error('Not able to save user! Password hash failed! ', err);
        next(new Error('Not able to save user!'));
        return;
      }
      this.password = hash;
      next();
    });
  }
});

// Hash passwords before saving them
schema.pre('findOneAndUpdate', function preUpdate(next) {
  if (!this._update.password) {
    next();
    return;
  }

  const saltRounds = 10;
  bcrypt.hash(this._update.password, saltRounds, (err, hash) => {
    if (err) {
      log.error('Not able to save user! Password hash failed! ', err);
      next(new Error('Not able to save user!'));
      return;
    }
    this._update.password = hash;
    next();
  });
});

module.exports = mongoose.model('users', schema);
