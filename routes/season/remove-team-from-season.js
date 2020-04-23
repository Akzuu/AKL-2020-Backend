const { log } = require('../../lib');
const { Team, Season } = require('../../models');

const schema = {
  description: `Remove team from the season. 
  Hox: Erases season entry from the team model too! 
  Should only be used before tournament starts!

  Moderator / Admin rights required`,
  summary: 'Remove team from the season.',
  tags: ['Season'],
  params: {
    type: 'object',
    properties: {
      seasonId: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: {
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
  if (!req.auth.jwtPayload.roles.includes('admin')
  && !req.auth.jwtPayload.roles.includes('moderator')) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only admin / moderator can remove teams from the season!',
    });
    return;
  }

  let season;
  try {
    season = await Season.findOneAndUpdate(
      {
        _id: req.params.seasonId,
        teams: req.body.teamId,
      },
      {
        $pull: { teams: req.body.teamId },
      },
      {
        runValidators: true,
      },
    );
  } catch (error) {
    log.error('Error when trying to update season! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!season) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Season not found! / Team not part of the season!',
    });
    return;
  }

  try {
    await Team.findOneAndUpdate(
      {
        _id: req.body.teamId,
      },
      {
        $pull: { seasons: req.params.seasonId },
      },
      {
        runValidators: true,
      },
    );
  } catch (error) {
    log.error('Error when trying to remove users currentTeam! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
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
    url: '/:seasonId/teams/remove',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
