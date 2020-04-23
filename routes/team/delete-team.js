const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: 'Delete a team from the service. Requires admin role.',
  summary: 'Delete a team. Do not implement!',
  tags: ['Devtest'],
  params: {
    type: 'object',
    properties: {
      teamId: {
        type: 'string',
      },
    },
  },
  /*
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
  */
};

const handler = async (req, reply) => {
  if (!req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  let team;
  try {
    team = await Team.findOneAndDelete({
      _id: req.params.teamId,
    });
  } catch (error) {
    log.error('Error when trying to delete team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!team) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not found',
      message: 'Team not found',
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
    method: 'DELETE',
    url: '/:teamId/delete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
