const config = require('config');
const sendMail = require('./mail-handler');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

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
    ${HOST}${ROUTE_PREFIX}/user/confirm?token=${verificationToken}.
    This verification message was sent after creating an account with this email address, 
    or changing an email to this one.`);
  console.log(verificationToken);
};

module.exports = sendEmailVerification;
