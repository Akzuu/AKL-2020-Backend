const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Update users roles. Requires authorization and admin rights',
  summary: 'Update user roles',
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
    properties: {
      admin: {
        type: 'boolean',
        default: false,
      },
      moderator: {
        type: 'boolean',
        default: false,
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
  if (!req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }


  const payload = {
    roles: ['player'],
  };

  // Note that this will also remove roles
  if (req.body.admin) {
    payload.roles.push('admin');
  } else if (req.body.moderator) {
    payload.roles.push('moderator');
  }

  let user;
  try {
    user = await User.findOneAndUpdate({ _id: req.params.id }, payload);
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

  let accessToken;
  let refreshToken;
  if (req.auth.newTokens) {
    [accessToken, refreshToken] = req.auth.newTokens;
  }

  reply.send({ status: 'OK', accessToken, refreshToken });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'PATCH',
    url: '/:id/roles',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
