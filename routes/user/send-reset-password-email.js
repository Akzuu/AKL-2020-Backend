const config = require('config');
const { log, sendMail } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

const schema = {
  description: 'Reset password for current user',
  summary: 'Reset password',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: {
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
  // Make sure user is reseting his / her own account
  if (req.params.id !== req.auth.jwtPayload._id
    && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  let user;
  try {
    user = await User.findOne({ _id: req.params.id });
  } catch (error) {
    log.error('Error when trying to find user! ', error);
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
      expiresIn: '10min',
    });
  } catch (error) {
    log.error('Error when trying to create confirmation token', error);
  }

  // Send email with link to reset password
  try {
    await sendMail(user.email,
      'Password change',
      `Please click to change password :D ${HOST}${ROUTE_PREFIX}/user/nullify-password?token=${resetToken}`);
  } catch (error) {
    log.error('Error when trying to send an email', error);
  }

  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/:id/send-reset-password',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
