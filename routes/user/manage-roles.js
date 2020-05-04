const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: `Update users roles. Requires authorization and admin rights.
                NOTE: WILL REMOVE UNREGISTERED ROLE IF USER HAS NOT COMPLETED REGISTRATION!
                WILL ALWAYS GIVE "player" ROLE!`,
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

  const roles = [];

  // Note that this will also remove roles
  if (req.body.admin) {
    roles.push('admin');
  } else if (req.body.moderator) {
    roles.push('moderator');
  }

  // First finds the user
  let user;
  try {
    user = await User.findById(req.params.id);
  } catch (error) {
    log.error('Error when trying to find the user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // Remove all roles user already has
  roles.forEach((role) => {
    const index = user.roles.indexOf(role);
    if (index > -1) {
      roles.splice(index, 1);
    }
  });

  // If no roles left, user has already all the given roles
  if (!roles.length) {
    log.error('The user already has all the given roles! ');
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
    });
  } else {
    try {
      user.roles.push(roles);
      user.save();
    } catch (error) {
      log.error('Error trying to push new role! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
    }
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'User not found.',
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
    url: '/:id/roles',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
