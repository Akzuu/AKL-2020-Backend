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
  if (req.body.userId === req.auth.jwtPayload._id) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'User can\'t remove him/herself',
    });
  }

  let team;
  try {
    team = await Team.findOne({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    }).populate('seasons', 'seasonEnded');
  } catch (error) {
    log.error('Error when trying to find team! ', error);
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

  // Only allow removing member if team is not part of an active season
  if (team.seasons.filter(season => season.seasonEnded !== true).length !== 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'You can not remove team member during an active season!',
    });
    return;
  }

  team.members = team.members
    .filter(member => String(member) !== req.body.userId);

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


  try {
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        $pull: { currentTeams: req.params.teamId },
        $push: { previousTeams: req.params.teamId },
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
