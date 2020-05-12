const { log } = require('../../lib');
const { Comment } = require('../../models');

const schema = {
  description: 'Update comment',
  summary: 'Update comment',
  tags: ['Comment'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      comment: {
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
  if (req.params.id !== req.auth.jwtPayload._id
    && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  try {
    await Comment.findOneAndUpdate({
      _id: req.params.id,
    }, {
      comment: req.body.comment,
    }, {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error when trying to update comment! ', error);
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
    url: '/:id/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
