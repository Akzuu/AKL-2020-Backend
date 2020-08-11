const config = require('config');
const bcrypt = require('bcrypt');
const { log, sendMail } = require('../../lib');
const { User } = require('../../models');

const FRONTEND_PASSWORD_RESET_URI = config.get('frontendPasswordResetUri');

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
  // Create hash for security reasons
  const saltRounds = 10;
  const hashString = `${Date.now()}${req.body.email}`;
  let resetHash;
  try {
    resetHash = await bcrypt.hash(hashString, saltRounds);
  } catch (error) {
    log.error('Not able to save user! Password hash failed! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  // Update required info to user for password reset
  let user;
  try {
    user = await User.findOneAndUpdate({
      email: req.body.email,
    }, {
      $push: { roles: 'passwordReset' },
      resetHash,
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
      resetHash,
    }, {
      expiresIn: '24h',
    });
  } catch (error) {
    log.error('Error trying to create confirmation token! ', error);
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
      `Password reset was requested for user ${user.username}. Please click to change password. The link is valid for 24 hours.
      ${FRONTEND_PASSWORD_RESET_URI}?resetToken=${resetToken}`);
  } catch (error) {
    log.error('Error trying to send an email! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
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
