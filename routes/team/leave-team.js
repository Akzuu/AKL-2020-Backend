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

const handler = async (req, reply) => {
  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
      members: { $elemMatch: req.auth.jwtPayload._id },
    },
    {
      $pull: { members: { $elemMatch: req.auth.jwtPayload._id } },
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
  if (team.captain === req.auth.jwtPayload._id) {
    // Try to assign team member as the new captain
    if (team.members.length !== 0) {
      try {
        await Team.findOneAndUpdate(
          {
            _id: req.params.teamId,
          },
          {
            captain: team.members[0],
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
    } else {
      // Hide team, because it no longer has active members
      try {
        await Team.findOneAndUpdate(
          {
            _id: req.params.teamId,
          },
          {
            hidden: true,
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
