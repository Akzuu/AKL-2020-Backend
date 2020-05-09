const { log, fetchRiotUser, fetchUserRank } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Verifies user has riot account by fetching it from Riot Api.',
  summary: 'Verifies users riot account',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      riotUsername: {
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
      },
    },
  },
};

const handler = async (req, reply) => {
  let riotUser;
  try {
    riotUser = await fetchRiotUser(req.body.riotUsername);
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

  if (!riotUser) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Riot user not found.',
    });
    return;
  }

  let rank;
  try {
    rank = await fetchUserRank(riotUser.id);
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

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: req.auth.jwtPayload._id,
    }, {
      $set: {
        'riotGames.username': req.body.riotUsername,
        'riotGames.encryptedSummonerId': riotUser.id,
        'riotGames.rank': rank,
      },
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

  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/update-riot-username',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
