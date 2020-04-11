const { log } = require('../../lib');
const { Team } = require('../../models');
// const { User } = require('../../models');

const schema = {
  description: 'Delete a team from the service. Requires authentication',
  summary: 'Delete a team',
  tags: ['Team'],
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
  let team;
  try {
    team = await Team.findOneAndDelete({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
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
    url: '/:teamId/delete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
