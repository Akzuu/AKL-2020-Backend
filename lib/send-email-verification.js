const config = require('config');
const sendMail = require('./mail-handler');
const log = require('./logger');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

const sendEmailVerification = async (user, reply) => {
  // Send email verification
  let verificationToken;
  try {
    verificationToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (error) {
    log.error('Error trying to create verification token! ', error);
  }
  try {
    await sendMail(user.email,
      'Verify email',
      `Email verification is required on account ${user.username}.
      Please verify your email by opening this link: 
      ${HOST}${ROUTE_PREFIX}/user/confirm?token=${verificationToken}.
      This verification message was sent after creating an account with this email address, 
      or changing an email to this one.`);
  } catch (error) {
    log.error('Error sending the verification email! ', error);
  }
};

module.exports = sendEmailVerification;
