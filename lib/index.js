const log = require('./logger');
const createUser = require('./create-user-steam');
const auth = require('./auth');
const getCaptainEmails = require('./get-seasons-captain-emails');
const sendMail = require('./mail-handler');
const sendEmailVerification = require('./send-email-verification');
const createSuperAdmin = require('./create-superadmin');
const insertTestData = require('./insert-test-data');
const { fetchRiotUser, fetchUserRank } = require('./riot/fetch-riot-user-info');
const handleRiotApiErrors = require('./riot/handle-riot-api-errors');
const calculateAverageRiotRank = require('./riot/calculate-average-riot-rank');

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
  calculateAverageRiotRank,
  handleRiotApiErrors,
};
