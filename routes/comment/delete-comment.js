const { log } = require('../../lib');
const { Comment, Text } = require('../../models');

const schema = {
  description: 'Delete comment. Will also remove it from Text objects',
  summary: 'Delete comment',
  tags: ['Comment'],
  params: {
    type: 'object',
    properties: {
      id: {
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

  let comment;
  try {
    comment = await Comment.findOneAndDelete({
      _id: req.params.id,
    });
  } catch (error) {
    log.error('Error when trying to delete comment! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!comment) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Comment not found!',
    });
    return;
  }

  try {
    await Text.findOneAndUpdate({
      _id: comment.text,
    }, {
      $pull: { comments: req.params.id },
    });
  } catch (error) {
    log.error('Error when trying to remove comment link to text! ', error);
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
    method: 'DELETE',
    url: '/:id/delete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
