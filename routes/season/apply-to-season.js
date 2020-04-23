const { log } = require('../../lib');
const { User, Season } = require('../../models');

const schema = {
  description: 'Apply as a team to season. Requires authorization',
  summary: 'Apply to season.',
  tags: ['Season'],
  params: {
    type: 'object',
    properties: {
      seasonId: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      applicationText: {
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
    user = await User.findOne({ _id: req.auth.jwtPayload._id }, {
      password: 0,
    })
      .populate('currentTeam');
  } catch (error) {
    log.error('Error finding the user: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user || !user.currentTeam) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'User does not have a team',
    });
    return;
  }

  if (user.currentTeam.seasons.includes(req.params.seasonId)) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Team already belongs to the season!',
    });
    return;
  }

  if (String(user._id) !== String(user.currentTeam.captain)) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only captain can apply to a season!',
    });
    return;
  }

  let season;
  try {
    season = await Season.findOneAndUpdate({ _id: req.params.seasonId }, {
      $push: {
        applications: {
          applicationText: req.body.applicationText,
          team: user.currentTeam,
        },
      },
    });
  } catch (error) {
    log.error('Error when trying to update seasons applications! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!season) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Season not found!',
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
    url: '/:seasonId/applications/apply',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
