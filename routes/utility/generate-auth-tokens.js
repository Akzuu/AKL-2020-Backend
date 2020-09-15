const schema = {
  description: 'Get new tokens for user. Note: Will only work if refreshToken is used as the bearer token!',
  summary: 'Token generator',
  tags: ['Utility'],
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

const handler = (req, reply) => {
  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/tokens',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
