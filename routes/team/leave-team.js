const { log } = require('../../lib');
const { Team, User } = require('../../models');

const schema = {
  description: 'Leave team. Requires authorization',
  summary: 'Leave team.',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      teamId: {
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


// TODO: Optimize Team database queries
const handler = async (req, reply) => {
  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
      members: req.auth.jwtPayload._id,
    },
    {
      $pull: { members: req.auth.jwtPayload._id },
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
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Team not found. Is user part of this team?',
    });
    return;
  }

  // Captain leaving the team
  if (String(team.captain) === req.auth.jwtPayload._id) {
    let updatePayload;

    /**
     * If there are still members to the team, assign one of them
     * as the new captain
     * else hide the team, because there are no more members for it
     */
    if (team.members.length !== 0) {
      updatePayload = { captain: team.members[0] };
    } else {
      updatePayload = { hidden: true };
    }

    try {
      await Team.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          updatePayload,
        },
        {
          runValidators: true,
        },
      );
    } catch (error) {
      log.error('Error when trying to assign new captain automaticly! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
  }


  // Update user profile
  try {
    await User.findOneAndUpdate(
      {
        _id: req.auth.jwtPayload._id,
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
    url: '/:teamId/members/leave',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
