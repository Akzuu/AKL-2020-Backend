const bcrypt = require('bcrypt');

const { User } = require('../models');

const authenticate = async (server) => {
  server.decorate('verifyUserAndPassword', verifyUserAndPassword);
};

const verifyUserAndPassword = async (request, reply, done) => {
  if (!request.body || !request.body.user) {
    return done(new Error('Missing user in request body.'));
  }

  let user;
  let password;
  try {
    user = await User.findOne({
      userName: request.body.user,
    });
    // Hash given password to check it against database hash
    const saltRounds = 10;
    bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
      if (err) {
        console.log('Password hash failed! ', err);
        return done(new Error('Not able to hash given password!'));
      }

      password = hash;
    });

    if (user.password !== password) {
      console.log('Passwords dont match!');
      return done(new Error('Wrong password! '));
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { authenticate };
