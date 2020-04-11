const createUser = require('./create-user');
const deleteUser = require('./delete-user');
const updateUser = require('./update-user');
const getUser = require('./get-user');
const getAllUsers = require('./get-all-users');
const completeRegistration = require('./complete-registration');
const manageRoles = require('./manage-roles');

module.exports = {
  createUser,
  deleteUser,
  updateUser,
  getUser,
  getAllUsers,
  completeRegistration,
  manageRoles,
};
