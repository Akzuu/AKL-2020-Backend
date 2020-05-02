const { log, sendEmailVerification } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Sends email verification after changing email',
  summary: 'Send email verification',
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
  // Make sure user is trying to re-send verification to own account
  if (req.params.id !== req.auth.jwtPayload._id
    && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  // Find user with given id
  let user;
  try {
    user = await User.findByIdAndUpdate(req.params.id, {
      $push: { roles: 'unConfirmedEmail' },
    });
  } catch (error) {
    log.error('Error finding the user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // Send verification email
  try {
    await sendEmailVerification(user, reply);
  } catch (error) {
    log.error('Error sending an email! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/:id/send-verification',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
