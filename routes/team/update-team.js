const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: 'Update teams info. Requires authorization',
  summary: 'Update team info.',
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
      teamName: {
        type: 'string',
        minLength: 3,
      },
      abbreviation: {
        type: 'string',
        minLength: 1,
        maxLength: 11,
      },
      introductionText: {
        type: 'string',
      },
      rank: {
        type: 'string',
        enum: [
          'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
          'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
          'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
          'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
          'Supreme Master First Class', 'Global Elite'],
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
  if (Object.keys(req.body).length === 0) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Atleast one change is required',
    });
    return;
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
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Only captain can update the team!',
    });
    return;
  }

  // Only allow updating team if team is not part of an active season
  if (team.seasons.filter(season => season.seasonEnded !== true).length !== 0) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'Team cannot be updated when it is part of an active season',
    });
    return;
  }

  try {
    await Team.updateOne({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    }, req.body, {
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
    url: '/:teamId/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
