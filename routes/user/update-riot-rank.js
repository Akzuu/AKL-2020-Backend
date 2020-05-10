const { log, fetchUserRank } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Updates users riot rank by fetching it from Riot Api.',
  summary: 'Updates users riot rank',
  tags: ['User'],
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  let user;
  try {
    user = await User.findOne({
      _id: req.auth.jwtPayload._id,
    });
  } catch (error) {
    log.error('Cannot find the user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'User not found.',
    });
    return;
  }

  let rank;
  try {
    rank = await fetchUserRank(user.riotGames.encryptedSummonerId);
  } catch (error) {
    if (error.name === 'RequestError') {
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
        message: 'Failed to send network request! ',
      });
      return;
    }
    reply.status(error.statusCode).send({
      status: error.status,
      error: error.error,
      message: error.message,
    });
    return;
  }

  try {
    await User.findOneAndUpdate({
      _id: user._id,
    }, {
      $set: { 'riotGames.rank': rank },
    });
  } catch (error) {
    log.error('Error trying to add the new role! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/update-riot-rank',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
