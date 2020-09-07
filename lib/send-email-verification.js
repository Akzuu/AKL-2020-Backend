const config = require('config');
const sendMail = require('./mail-handler');

const FRONTEND_EMAIL_VERIFICATION_URL = config.get('frontendEmailVerificationUri');
const ALL_FRONTEND_EMAIL_VERIFICATION_URL = config.get('allFrontendEmailVerificationUri');

const sendEmailVerification = async (user, reply, game = 'csgo') => {
  // Create verification token
  const verificationToken = await reply.jwtSign({
    _id: user._id,
  }, {
    expiresIn: '2d',
  });

  let emailVerificationUrl = FRONTEND_EMAIL_VERIFICATION_URL;
  if (game === 'lol') {
    emailVerificationUrl = ALL_FRONTEND_EMAIL_VERIFICATION_URL;
  }

  // Send token via mail
  await sendMail(user.email,
    'Verify email',
    `Email verification is required on account ${user.username}.
    Please verify your email by opening this link:

    ${emailVerificationUrl}?token=${verificationToken}

    This verification message was sent after creating an account with this email address, 
    or changing an email to this one.`);
};

module.exports = sendEmailVerification;
