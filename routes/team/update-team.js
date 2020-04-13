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
    team = await Team.findOneAndUpdate({
      _id: req.params.teamId,
      captain: req.auth.jwtPayload._id,
    }, req.body,
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
