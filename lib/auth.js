const bcrypt = require('bcrypt');

const { log } = require('./logger');
const { User } = require('../models');

const verifyEmailAndPassword = async (request, reply, done) => {
  if (!request.body || !request.body.email || !request.body.password) {
    done(new Error('Missing body parameters email or password'));
    return;
  }

  let user;
  let password;
  const saltRounds = 10;

  bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
    if (err) {
      log.error('Password hash failed! ', err);
      done(new Error('Not able to hash given password!'));
      return;
    }

    password = hash;
  });


  try {
    user = await User.findOne({
      email: request.body.email,
      password,
    });
  } catch (error) {
    log.error(error);
  }

  if (!user) {
    done(new Error('User does not exist or wrong password was given!'));
    return;
  }

  done(true);
};

module.exports = { verifyEmailAndPassword };
