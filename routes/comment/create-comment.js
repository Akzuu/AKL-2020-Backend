const { log } = require('../../lib');
const { Comment, Text } = require('../../models');

const schema = {
  description: 'Create new comment to a post',
  summary: 'Create comment resource',
  tags: ['Comment'],
  body: {
    type: 'object',
    required: ['textId', 'comment'],
    properties: {
      textId: {
        type: 'string',
        description: 'Aka post id',
      },
      comment: {
        type: 'string',
        description: 'Actual comment',
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
  const payload = {
    text: req.body.textId,
    comment: req.body.comment,
    author: req.auth.jwtPayload._id,
  };

  let comment;
  try {
    comment = await Comment.create(payload);
  } catch (error) {
    log.error('Error when trying to create comment! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  try {
    await Text.findOneAndUpdate({
      _id: req.body.textId,
    }, {
      $push: { comments: comment._id },
    });
  } catch (error) {
    log.error('Error when trying to link comment to text! ', error);
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
