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
    team = await Team.findOne({
      _id: req.params.teamId,
      members: req.auth.jwtPayload._id,
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
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Team not found. Is user part of this team?',
    });
    return;
  }

  // Only allow leaving team if team is not part of an active season
  if (team.seasons.filter(season => season.seasonEnded !== true).length !== 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'You can not leave team during an active season!',
    });
    return;
  }

  // Remove member
  team.members = team.members.filter(
    member => String(member._id) !== req.auth.jwtPayload._id,
  );

  // Captain leaving the team
  if (String(team.captain) === req.auth.jwtPayload._id) {
    /**
     * If there are still members to the team, assign one of them
     * as the new captain
     * else hide the team, because there are no more members for it
     */
    if (team.members.length > 0) {
      [team.captain] = team.members;
    } else {
      team.hidden = true;
      team.captain = null;
    }
  }

  try {
    await team.save();
  } catch (error) {
    log.error('Error when trying to update Team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  // Update user profile
  try {
    await User.findOneAndUpdate(
      {
        _id: req.auth.jwtPayload._id,
      },
      {
        $pull: { currentTeams: req.params.teamId },
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
