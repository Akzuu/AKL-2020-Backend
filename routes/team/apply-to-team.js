const { log } = require('../../lib');
const { Team, User } = require('../../models');

const schema = {
  description: 'Apply to be a member of a team. Requires authorization',
  summary: 'Apply to team.',
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

  // Find the team to be applied to
  let team;
  try {
    team = await Team.findById(req.params.teamId);
  } catch (error) {
    log.error('Error finding the team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!team) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
    });
    return;
  }

  if (team.applications.filter(
    application => String(application.user) === String(user._id),
  ).length > 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Already applied to this team!',
    });
  }

  if (user.currentTeams.filter(
    currentTeam => currentTeam.game === team.game,
  ).length > 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'You already belong to a team in this game!',
    });
    return;
  }

  const applicationPayload = {
    applicationText: req.body.applicationText,
    user: req.auth.jwtPayload._id,
  };

  try {
    await Team.findOneAndUpdate({
      _id: team._id,
    }, {
      $push: { applications: applicationPayload },
    });
  } catch (error) {
    log.error('Error when trying to update team! ', error);
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
    url: '/:teamId/applications/apply',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
