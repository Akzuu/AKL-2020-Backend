const config = require('config');
const { log } = require('../../lib');
const { User } = require('../../models');

const REDIRECT_URI = config.get('loginRedirectUri');

const schema = {
  description: 'Reset users password. Requires authorization',
  summary: 'Reset password',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['newPassword'],
    properties: {

      newPassword: {
        type: 'string',
        minLength: 8,
      },

      resetToken: {
        type: 'string',
      },
    },
  },

  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  // Check the user has valid temporary resetToken
  req.raw.headers.authorization = `Bearer ${req.body.resetToken}`;
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Internal Server Error"`);
    return;
  }

  let user;

  // Find user, set new password and remove reset role
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
      password: null,
      roles: 'passwordReset',
    }, {
      password: req.body.newPassword,
      $pull: { roles: 'passwordReset' },
    },
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error resetting a password!', error);
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Internal Server Error"`);
    return;
  }

  if (!user) {
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Bad Request"&message="Password reset not requested!"`);
    return;
  }

  // Redirect to login page
  reply.redirect(`${REDIRECT_URI}?status=OK`);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/reset-password',
    handler,
    schema,
  });
};
