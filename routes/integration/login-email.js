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
        token: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  let token;
  try {
    // Note: preValidation writes req.body.jwtPayload!
    token = await reply.jwtSign(req.body.jwtPayload);
  } catch (error) {
    log.error('Error creating token!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send({ status: 'OK', token });
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
