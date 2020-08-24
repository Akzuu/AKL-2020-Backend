const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Confirms email',
  summary: 'Cpnfirm email',
  tags: ['User'],
  query: {
    type: 'object',
    properties: {
      token: {
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
      },
    },
  },
};

const handler = async (req, reply) => {
  req.raw.headers.authorization = `Bearer ${req.query.token}`;
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
      emailConfirmed: false,
    }, {
      emailConfirmed: true,
      $pull: { roles: 'unConfirmedEmail' },
    });
  } catch (error) {
    log.error('Error updating user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  if (!user) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Email confirmed already!',
    });
  }

  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/confirm',
    handler,
    schema,
  });
};
