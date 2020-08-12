const { log } = require('../../lib');
const { User, Season } = require('../../models');

const schema = {
  description: 'Apply as a team to season. Requires authorization',
  summary: 'Apply to season.',
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
      applicationText: {
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
  let user;
  try {
    user = await User.findOne({
      _id: req.auth.jwtPayload._id,
    }, {
      password: 0,
    })
      .populate('currentTeams');
  } catch (error) {
    log.error('Error finding the user: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user || !user.currentTeams) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'User does not belong to a team! ',
    });
    return;
  }

  if (user.currentTeams.filter(
    currentTeam => currentTeam.season === req.params.seasonId,
  ).length > 0) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Team already belongs to the season!',
    });
    return;
  }

  let season;
  try {
    season = await Season.findOne({
      _id: req.params.seasonId,
    });
  } catch (error) {
    log.error('Error trying to find the season! ', error);
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
      message: 'Season not found!',
    });
    return;
  }

  if (!season.acceptParticipants) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'This season is not currently accepting any participants',
    });
  }

  // Find the team matching with seasons game
  const [applyingTeam] = user.currentTeams.filter(
    currentTeam => currentTeam.game === season.game,
  );

  if (!applyingTeam) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'User is not in a team playing the same game as the season to be applied to!',
    });
    return;
  }

  if (String(user._id) !== String(applyingTeam.captain)) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only captain can apply to a season!',
    });
    return;
  }

  if (season.applications.filter(
    application => String(application.team) === String(applyingTeam._id),
  ).length > 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Already applied to this season!',
    });
  }

  try {
    await Season.findOneAndUpdate({
      _id: req.params.seasonId,
    }, {
      $push: {
        applications: {
          applicationText: req.body.applicationText,
          team: applyingTeam,
        },
      },
    });
  } catch (error) {
    log.error('Error when trying to update seasons applications! ', error);
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
    url: '/:seasonId/applications/apply',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
