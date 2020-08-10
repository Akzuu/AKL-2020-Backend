const config = require('config');
const { log } = require('../../lib');
const { Team, User } = require('../../models');

const GAMES = config.get('games');

const schema = {
  description: 'Create new team for the service',
  summary: 'Create a team',
  tags: ['Team'],
  body: {
    type: 'object',
    required: ['teamName', 'abbreviation', 'introductionText', 'game', 'rank'],
    properties: {
      teamName: {
        type: 'string',
        minLength: 3,
      },
      abbreviation: {
        type: 'string',
        minLength: 1,
        maxLength: 11,
      },
      introductionText: {
        type: 'string',
      },
      game: {
        type: 'string',
      },
      rank: {
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
  if (!GAMES.find(game => game === req.body.game)) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Given game is not supported! ',
    });
    return;
  }

  let user;
  try {
    user = await User.findOne({
      _id: req.auth.jwtPayload._id,
    })
      .populate('currentTeams');
  } catch (error) {
    log.error('Error when trying to find user! ', error);
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

  if (user.currentTeams.filter(team => team.game === req.body.game).length > 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'You already belong to a team in this game!',
    });
    return;
  }

  const payload = req.body;
  payload.captain = req.auth.jwtPayload._id;
  payload.members = [req.auth.jwtPayload._id];

  if (req.body.game === 'League of Legends') {
    payload.rank = user.riotGames.rank;
  }

  let team;
  try {
    team = await Team.create(req.body);
  } catch (error) {
    log.error('Error when trying to create team! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }


  // Push new team to user info
  try {
    await User.findOneAndUpdate({
      _id: user._id,
    }, {
      $push: { currentTeams: team._id },
    });
  } catch (error) {
    log.error('Error when trying to set current team for user! ', { error, body: req.body });
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
