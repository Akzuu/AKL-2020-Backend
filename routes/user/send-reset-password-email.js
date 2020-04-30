const config = require('config');
const { log, sendMail } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

const schema = {
  description: 'Reset password for current user',
  summary: 'Reset password',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      email: {
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
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  // Make sure user is reseting password with correct email address
  let user;
  try {
    user = await User.findOne({
      email: req.body.email,
    });
  } catch (error) {
    log.error('User not found with given email! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
    });
    return;
  }

  // Create temp resetToken to verify user in later phases
  let resetToken;
  try {
    resetToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '1h',
    });
  } catch (error) {
    log.error('Error trying to create confirmation token! ', error);
    return;
  }

  // Add the temporary token to database for security reasons
  try {
    await User.findOneAndUpdate({
      email: req.body.email,
    }, {
      $push: { roles: 'passwordReset' },
      resetToken,
    });
  } catch (error) {
    log.error('User not found with given email! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // Send email with link to reset password
  try {
    await sendMail(user.email,
      'Password change',
      `Password reset was requested for user ${user.username}. Please click to change password. The link is valid for one (1) hour.
      ${HOST}${ROUTE_PREFIX}/user/reset-password?resetToken=${resetToken}`);
  } catch (error) {
    log.error('Error trying to send an email! ', error);
    return;
  }
  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/send-reset-password',
    handler,
    schema,
  });
};
