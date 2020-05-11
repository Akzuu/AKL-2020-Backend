const createUser = require('./create-user');
const deleteUser = require('./delete-user');
const updateUser = require('./update-user');
const getUser = require('./get-user');
const getUserByUsername = require('./get-user-by-username');
const getAllUsers = require('./get-all-users');
const completeRegistration = require('./complete-registration');
const manageRoles = require('./manage-roles');
const confirmEmail = require('./confirm-email');
const resetPassword = require('./reset-password');
const sendResetPasswordEmail = require('./send-reset-password-email');
const resendEmailVerification = require('./resend-email-verification');
const updateRiotUsername = require('./update-riot-username');
const updateUserRank = require('./update-riot-rank');

module.exports = {
  createUser,
  deleteUser,
  updateUser,
  getUser,
  getUserByUsername,
  getAllUsers,
  completeRegistration,
  manageRoles,
  confirmEmail,
  resetPassword,
  sendResetPasswordEmail,
  resendEmailVerification,
  updateRiotUsername,
  updateUserRank,
};
