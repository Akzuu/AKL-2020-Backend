const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: 'Update season resource',
  summary: 'Update season',
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
    properties: {
      seasonName: {
        type: 'string',
      },
      seasonNumber: {
        type: 'string',
      },
      division: {
        type: 'string',
      },
      informationText: {
        type: 'string',
      },
      year: {
        type: 'number',
      },
      hidden: {
        type: 'boolean',
      },
      acceptParticipants: {
        type: 'boolean',
      },
      maximumParticipants: {
        type: 'number',
      },
      challonge: {
        subdomain: {
          type: 'string',
          description: 'Subdomain used in challonge url. E.g subdomain akl = akl.challonge.com/...',
        },
        twoStageTournament: {
          type: 'boolean',
          default: false,
          description: 'If tournament is not a two stage tournament, final choices are the only ones that matter',
        },
        groupStageTournamentType: {
          type: 'string',
          enum: ['single elimination', 'double elimination', 'round robin'],
          default: 'round robin',
        },
        groupSize: {
          type: 'number',
          default: 4,
          min: 2,
          max: 20,
        },
        groupAdvance: {
          type: 'number',
          default: 2,
          min: 1,
          max: 20,
          description: 'How many teams proceed to final stage from the groups',
        },
        groupRankBy: {
          type: 'string',
          enum: ['match wins', 'points scored', 'points difference'],
          default: 'match wins',
        },
        finalStageTournamentType: {
          type: 'string',
          enum: ['single elimination', 'double elimination', 'round robin', 'swiss'],
          default: 'single elimination',
          description: 'If tournament is not a two stage tournament, final choices are the only ones that matter',
        },
        finalStageIncludeMatchForThird: {
          type: 'boolean',
          default: false,
        },
        finalStageSwissRounds: {
          type: 'number',
        },
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
  if (!req.auth.jwtPayload.roles.includes('moderator')
  && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  if (Object.keys(req.body).length === 0) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Atleast one change is required',
    });
    return;
  }

  let season;
  try {
    season = await Season.findOneAndUpdate({
      _id: req.params.seasonId,
    },
    req.body,
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error updating season: ', error);
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
    url: '/:seasonId/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
