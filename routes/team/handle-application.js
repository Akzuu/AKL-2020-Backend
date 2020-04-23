const { log } = require('../../lib');
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
  let payload;
  if (req.body.accepted) {
    payload = {
      $push: { members: req.body.userId },
      $pull: { applications: { user: req.body.userId } },
    };
  } else {
    payload = {
      $pull: { applications: { user: req.body.userId } },
    };
  }

  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    },
    payload,
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
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only captain can update the team!',
    });
    return;
  }

  // Update users profile only after we have made sure team update was a success
  if (req.body.accepted) {
    try {
      await User.findOneAndUpdate({ _id: req.body.userId }, {
        currentTeam: req.params.teamId,
      }, {
        runValidators: true,
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
