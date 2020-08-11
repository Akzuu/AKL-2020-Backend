const config = require('config');
const sendMail = require('./mail-handler');

const FRONTEND_EMAIL_VERIFICATION_URL = config.get('frontendEmailVerificationUri');

const sendEmailVerification = async (user, reply) => {
  // Create verification token
  const verificationToken = await reply.jwtSign({
    _id: user._id,
  }, {
    expiresIn: '2d',
  });

  // Send token via mail
  await sendMail(user.email,
    'Verify email',
    `Email verification is required on account ${user.username}.
    Please verify your email by opening this link: 
    ${FRONTEND_EMAIL_VERIFICATION_URL}?token=${verificationToken}.
    This verification message was sent after creating an account with this email address, 
    or changing an email to this one.`);
};

module.exports = sendEmailVerification;
