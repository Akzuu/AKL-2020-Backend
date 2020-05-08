const log = require('./logger');
const createUser = require('./create-user-steam');
const auth = require('./auth');
const getCaptainEmails = require('./get-seasons-captain-emails');
const sendMail = require('./mail-handler');
const sendEmailVerification = require('./send-email-verification');
const createSuperAdmin = require('./create-superadmin');
const insertTestData = require('./insert-test-data');
const fetchRiotUser = require('./fetch-riot-user');
const fetchUserRank = require('./fetch-user-rank');
const handleRiotApiErrors = require('./handle-riot-api-errors');

module.exports = {
  log,
  createUser,
  auth,
  getCaptainEmails,
  sendMail,
  sendEmailVerification,
  createSuperAdmin,
  insertTestData,
  fetchRiotUser,
  fetchUserRank,
  handleRiotApiErrors,
};
