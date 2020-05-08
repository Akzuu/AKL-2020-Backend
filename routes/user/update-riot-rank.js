const { log, fetchRiotUser, fetchUserRank } = require('../../lib');
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
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    log.error('Error validating token! ', error);
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    return;
  }

  let user;
  try {
    user = await User.findOne({
      _id: authPayload._id,
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

  let riotUser;
  try {
    riotUser = await fetchRiotUser(user.riotGames.username);
  } catch (error) {
    if (!error.statusCode) {
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
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

  let rank;
  try {
    rank = await fetchUserRank(riotUser.id);
  } catch (error) {
    reply.status(error.statusCode).send({
      status: error.status,
      error: error.error,
      message: error.message,
    });
    return;
  }

  user.riotGames.rank = rank;
  user.save();

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
