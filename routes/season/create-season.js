const config = require('config');
const { log } = require('../../lib');
const { Season } = require('../../models');

const GAMES = config.get('games');

const schema = {
  description: 'Create a new season to the service',
  summary: 'Create a season',
  tags: ['Season'],
  body: {
    type: 'object',
    required: ['seasonName', 'seasonNumber', 'division', 'year', 'game', 'hidden'],
    properties: {
      seasonName: {
        type: 'string',
      },
      seasonNumber: {
        type: 'number',
        min: 0,
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
      game: {
        type: 'string',
      },
      hidden: {
        type: 'boolean',
        default: false,
      },
      acceptParticipants: {
        type: 'boolean',
        default: true,
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
  if (!GAMES.find(game => game === req.body.game)) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Given game is not supported! ',
    });
    return;
  }

  if (!req.auth.jwtPayload.roles.includes('admin')
  && !req.auth.jwtPayload.roles.includes('moderator')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  try {
    await Season.create(req.body);
  } catch (error) {
    log.error('Error when trying to create season! ', error);
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
    url: '/create',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
