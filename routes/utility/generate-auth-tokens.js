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
        jwtPayload: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            steamID64: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

const handler = (req, reply) => {
  const { newTokens = {}, jwtPayload = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    jwtPayload,
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
