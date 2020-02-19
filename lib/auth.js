const bcrypt = require('bcrypt');

const { User } = require('../models');

const verifyUserAndPassword = async (request, reply, done) => {
  if (!request.body || !request.body.user) {
    done(new Error('Missing user in request body.'));
    return;
  }

  let user;
  let password;
  try {
    // Change to email
    user = await User.findOne({
      userName: request.body.user,
    });
    // Hash given password to check it against database hash
    const saltRounds = 10;
    bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
      if (err) {
        console.log('Password hash failed! ', err);
        done(new Error('Not able to hash given password!'));
        return;
      }

      password = hash;
    });

    if (user.password !== password) {
      console.log('Passwords dont match!');
      done(new Error('Wrong password! '));
      return;
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { verifyUserAndPassword };
