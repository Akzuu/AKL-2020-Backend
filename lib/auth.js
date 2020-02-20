const bcrypt = require('bcrypt');

const log = require('./logger');
const { User } = require('../models');

const verifyEmailAndPassword = async (req, reply, done) => {
  if (!req.body || !req.body.email || !req.body.password) {
    done(new Error('Missing body parameters email or password'));
    return;
  }

  let user;
  try {
    user = await User.findOne({
      email: req.body.email,
    });
  } catch (error) {
    log.error(error);
  }

  const samePassword = await bcrypt.compare(req.body.password, user.password);

  if (!samePassword) {
    done(new Error('User does not exist or wrong password was given!'));
    return;
  }

  req.body.jwtPayload = {
    _id: user._id,
    registrationComplete: user.registrationComplete,
    steamID64: user.steam.steamID64,
  };
};

const verifyJWT = async (req, reply, done) => {
  let payload;
  try {
    payload = await req.jwtVerify();
  } catch (error) {
    log.error('Error validating token! ', error);
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    done(new Error('Unauthorized'));
    return;
  }

  req.body.jwtPayload = payload;
};

module.exports = {
  verifyEmailAndPassword,
  verifyJWT,
};
