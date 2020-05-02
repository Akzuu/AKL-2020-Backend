const config = require('config');
const User = require('./../models/user');

const createSuperAdmin = async () => {
  await User.create({
    username: config.get('superAdminCredentials.username'),
    password: config.get('superAdminCredentials.password'),
    email: config.get('superAdminCredentials.email'),
    roles: ['admin'],
    registrationComplete: true,
    emailConfirmed: true,
  });
};

module.exports = createSuperAdmin;
