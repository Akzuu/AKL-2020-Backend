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
    user = await User.findOne({ _id: req.auth.jwtPayload._id });
  } catch (error) {
    log.error('Error when trying to find user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (user.currentTeam && Object.keys(user.currentTeam).length === 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'You already belong to a team!',
    });
    return;
  }

  const applicationPayload = {
    applicationText: req.body.applicationText,
    user: req.auth.jwtPayload._id,
  };

  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
    }, { $push: { applications: applicationPayload } },
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error when trying to update team! ', error);
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