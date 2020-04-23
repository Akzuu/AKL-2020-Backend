const { log } = require('../../lib');
const { Team, Season } = require('../../models');

const schema = {
  description: 'Handle applications to season. Moderator / Admin rights required',
  summary: 'Accept / decline applications.',
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
    required: ['teamId', 'accepted'],
    properties: {
      teamId: {
        type: 'string',
      },
      accepted: {
        type: 'boolean',
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
  if (!req.auth.jwtPayload.roles.includes('admin')
  && !req.auth.jwtPayload.roles.includes('moderator')) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only admin / moderator can accept teams to season!',
    });
    return;
  }

  let payload;
  if (req.body.accepted) {
    payload = {
      $push: { members: req.body.teamId },
      $pull: { applications: { $elemMatch: { team: req.body.teamId } } },
    };
  } else {
    payload = {
      $pull: { applications: { $elemMatch: { team: req.body.teamId } } },
    };
  }

  try {
    await Season.findOneAndUpdate({
      _id: req.params.seasonId,
    }, {
      payload,
    }, {
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

  // Update team profile if accepted
  if (req.body.accepted) {
    try {
      await Team.findOneAndUpdate({ _id: req.body.teamId }, {
        $push: { seasons: req.params.seasonId },
      }, {
        runValidators: true,
      });
    } catch (error) {
      log.error('Error when trying to update users currentTeam! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
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
    url: '/:seasonId/applications/handle',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
