const bcrypt = require('bcrypt');

const { log } = require('./logger');
const { User } = require('../models');

const verifyEmailAndPassword = async (request, reply, done) => {
  if (!request.body || !request.body.email || !request.body.password) {
    done(new Error('Missing body parameters email or password'));
    return;
  }

  let user;
  try {
    user = await User.findOne({
      email: request.body.email,
    });
  } catch (error) {
    log.error(error);
  }

  const samePassword = await bcrypt.compare(request.body.password, user.password);

  if (!samePassword) {
    done(new Error('User does not exist or wrong password was given!'));
  }

  request.body = {
    _id: user._id,
    registrationComplete: user.registrationComplete,
    steamID64: user.steam.steamID64,
  };
};

module.exports = { verifyEmailAndPassword };
