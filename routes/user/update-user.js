const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Update users info. Requires authorization',
  summary: 'Update user',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      firstName: {
        type: 'string',
      },
      surname: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      guild: {
        type: 'string',
      },
      university: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
        type: 'string',
        min: 8,
      },
      newPassword: {
        type: 'string',
        min: 8,
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
  if (req.params.id !== req.body.jwtPayload._id
    && !req.body.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
  }


  let user;
  try {
    user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
  } catch (error) {
    log.error('Error when trying to update user! ', error);
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

  reply.send({ status: 'OK' });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'PATCH',
    url: '/:id/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
