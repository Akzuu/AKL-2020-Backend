const { log } = require('../../lib');
const { Team, User } = require('../../models');

const schema = {
  description: 'Remove member from team. Requires authorization and captain rights',
  summary: 'Remove team member.',
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
    required: ['userId'],
    properties: {
      userId: {
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
  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    },
    {
      $pull: { members: { $elemMatch: req.body.userId } },
    },
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
      message: 'Only team captain can remove members!',
    });
    return;
  }

  try {
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        currentTeam: null,
        $push: { previousTeams: req.params.teamId },
      }, {
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
    url: '/:teamId/members/remove',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
