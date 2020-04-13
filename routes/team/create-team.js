const { log } = require('../../lib');
const { Team, User } = require('../../models');

const schema = {
  description: 'Create new team for the service',
  summary: 'Create a team',
  tags: ['Team'],
  body: {
    type: 'object',
    required: ['teamName', 'abbreviation', 'introductionText', 'rank'],
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

  const payload = req.body;
  payload.captain = req.auth.jwtPayload._id;
  payload.members = [req.auth.jwtPayload._id];

  try {
    await Team.create(req.body);
  } catch (error) {
    log.error('Error when trying to create team! ', { error, body: req.body });
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
    url: '/create',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
