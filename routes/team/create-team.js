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

  if (user.currentTeam != null) {
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

  let team;
  try {
    team = await Team.create(req.body);
  } catch (error) {
    log.error('Error when trying to create team! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }


  // Save current team for user
  user.currentTeam = team._id;
  try {
    await user.save();
  } catch (error) {
    log.error('Error when trying to set current team for user! ', { error, body: req.body });
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
