const config = require('config');
const User = require('./../models/user');

const ADMIN_USERNAME = config.get('superAdminCredentials.username');
const ADMIN_PASSWORD = config.get('superAdminCredentials.password');
const ADMIN_EMAIL = config.get('superAdminCredentials.email');

const createSuperAdmin = async () => {
  const user = await User.findOne({
    username: ADMIN_USERNAME,
  });

  if (!user) {
    await User.create({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      email: ADMIN_EMAIL,
      roles: ['admin'],
      registrationComplete: true,
      emailConfirmed: true,
    });
  }
};

module.exports = createSuperAdmin;
