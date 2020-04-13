const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { log } = require('../lib');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = new Schema({
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
  },
  email: {
    type: String,
    unique: true,
    match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Error invalid email'],
  },
  password: {
    type: String,
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
    userName: {
      type: String,
      required: true,
    },
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
    avatar: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
      required: true,
    },
  },
  tokens: [{
    token: {
      type: String,
    },
  }],
  registrationComplete: {
    type: Boolean,
    default: false,
  },
  roles: {
    type: Array,
    default: ['unregistered'],
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
