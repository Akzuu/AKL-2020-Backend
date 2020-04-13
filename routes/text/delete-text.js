const { log } = require('../../lib');
const { Text } = require('../../models');

const schema = {
  description: 'Delete text resource from the site',
  summary: 'Delete text',
  tags: ['Text'],
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
  if (!req.auth.jwtPayload.roles.includes('moderator')
  && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  try {
    await Text.findOneAndDelete({
      _id: req.params.id,
    });
  } catch (error) {
    log.error('Error deleting text: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
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
