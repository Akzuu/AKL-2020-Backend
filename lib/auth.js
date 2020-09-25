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
    done(new Error('Something went wrong.'));
    return;
  }

  if (!user) {
    done(new Error('User does not exist or wrong password was given!'));
    return;
  }

  // Bool for checking password
  const samePassword = await bcrypt.compare(req.body.password, user.password);

  if (!samePassword) {
    done(new Error('User does not exist or wrong password was given!'));
    return;
  }

  // set auth info for jwtPayload
  req.auth = {
    jwtPayload: {
      _id: String(user._id),
      roles: user.roles,
      steamID64: user.steam.steamID64,
    },
  };
};

const generateAuthTokens = async (userID, reply) => {
  let user;
  try {
    user = await User.findOne({ _id: userID });
  } catch (error) {
    log.error('Finding user failed! ', error);
    throw new Error('Finding user failed!');
  }

  let accessToken;
  let refreshToken;
  try {
    accessToken = await reply.jwtSign({
      _id: user._id,
      roles: user.roles,
      steamID64: user.steam.steamID64,
    }, {
      expiresIn: '10min',
    });
    refreshToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (error) {
    log.error('Error creating token!', error);
    throw new Error('Error creating token!');
  }

  return {
    newTokens: { accessToken, refreshToken },
    jwtPayload: {
      _id: String(user._id),
      roles: user.roles,
      steamID64: user.steam.steamID64,
    },
  };
};

const verifyJWT = async (req, reply, done) => {
  let payload;
  try {
    payload = await req.jwtVerify();
  } catch (error) {
    done(new Error('Unauthorized'));
    return;
  }

  // Check if accessToken was used (refreshTokens only contain _id)
  if (payload.roles && payload.steamID64) {
    req.auth = { jwtPayload: payload };
  } else {
    let auth;
    try {
      auth = await generateAuthTokens(payload._id, reply);
    } catch (error) {
      log.error('Error when generating new tokens! ', error);
      done(new Error('Internal Server Error'));
    }

    req.auth = auth;
  }
};

module.exports = {
  verifyEmailAndPassword,
  verifyJWT,
};
