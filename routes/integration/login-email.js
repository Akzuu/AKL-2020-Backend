const { log } = require('../../lib');


const schema = {
  description: 'Login user to the service with normal credentials',
  summary: 'Login with credentials',
  tags: ['Integration'],
  body: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
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
  let accessToken;
  let refreshToken;
  try {
    // Note: preValidation writes req.body.jwtPayload!
    accessToken = await reply.jwtSign(req.body.jwtPayload, {
      expiresIn: '10min',
    });
    refreshToken = await reply.jwtSign({
      _id: req.body.jwtPayload._id,
    }, {
      expiresIn: '2d',
    });
  } catch (error) {
    log.error('Error creating token!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send({ status: 'OK', accessToken, refreshToken });
};


module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/login',
    preValidation: fastify.auth([fastify.verifyEmailAndPassword]),
    handler,
    schema,
  });
};
