const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Delete user from the service. Requires authorization',
  summary: 'Delete user',
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
  // Make sure user is trying to remove his own account / admin is removing account
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
    user = await User.findOneAndDelete({
      _id: req.params.id,
    });
  } catch (error) {
    log.error('Error when trying to delete user! ', error);
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
      message: 'User not found.',
    });
    return;
  }

  let accessToken;
  let refreshToken;
  if (req.auth.newTokens) {
    [accessToken, refreshToken] = req.auth.newTokens;
  }

  reply.send({ status: 'OK', accessToken, refreshToken });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/:id/delete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
