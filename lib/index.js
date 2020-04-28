const log = require('./logger');
const createUser = require('./create-user-steam');
const auth = require('./auth');
<<<<<<< HEAD
const getCaptainEmails = require('./get-seasons-captain-emails');
=======
const sendMail = require('./mail-handler');
>>>>>>> 7715c2532f3136b8df786d9e67328cc05ab4a399

module.exports = {
  log,
  createUser,
  auth,
<<<<<<< HEAD
  getCaptainEmails,
=======
  sendMail,
>>>>>>> 7715c2532f3136b8df786d9e67328cc05ab4a399
};
