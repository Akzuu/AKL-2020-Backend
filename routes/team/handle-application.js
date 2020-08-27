const { log, calculateAverageRiotRank } = require('../../lib');
const { Team, User } = require('../../models');

const schema = {
  description: 'Handle applications to team. Requires authorization and captain rights',
  summary: 'Accept / decline applications.',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      teamId: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    required: ['userId', 'accepted'],
    properties: {
      userId: {
        type: 'string',
      },
      accepted: {
        type: 'boolean',
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
  let team;
  try {
    team = await Team.findOne({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    });
  } catch (error) {
    log.error('Error when trying to find team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!team) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Only the captain can update the team!',
    });
    return;
  }

  if (team.members.length >= 8) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Team is full! Consider removing some members before accepting new ones.',
    });
  }

  if (req.body.accepted) {
    team.members.push(req.body.userId);

    // Update LoL team rank
    if (team.game === 'League of Legends') {
      try {
        team.rank = await calculateAverageRiotRank(team.members);
      } catch (error) {
        log.error('Error trying to calculate average rank! ', error);
        reply.status(500).send({
          status: 'ERROR',
          error: 'Internal Server Error',
        });
        return;
      }
    }
  }

  team.applications = team.applications
    .filter(application => String(application.user) !== req.body.userId);

  try {
    await team.save();
  } catch (error) {
    log.error('Error when trying to update team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // Update users profile only after we have made sure team update was a success
  if (req.body.accepted) {
    try {
      await User.updateOne({
        _id: req.body.userId,
      }, {
        $push: { currentTeams: req.params.teamId },
      });
    } catch (error) {
      log.error('Error when trying to update users currentTeam! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
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
    url: '/:teamId/applications/handle',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
