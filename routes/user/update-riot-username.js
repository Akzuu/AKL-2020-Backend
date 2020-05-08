const { log, fetchRiotUser } = require('../../lib');
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

  let riotUser;
  try {
    riotUser = await fetchRiotUser(req.body.riotUsername);
  } catch (error) {
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

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
    }, {
      $set: { 'riotGames.username': req.body.riotUsername },
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
