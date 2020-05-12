const { log } = require('../../lib');
const { Text } = require('../../models');

const schema = {
  description: 'Get one text resource via :id',
  summary: 'Get text',
  tags: ['Text'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  response: {
    // 200: {
    //   type: 'object',
    //   properties: {
    //     status: {
    //       type: 'string',
    //     },
    //   },
    // },
  },
};

const handler = async (req, reply) => {
  let text;
  try {
    text = await Text.findOne({
      _id: req.params.id,
    })
      .populate('author', {
        _id: 1,
        username: 1,
      });
  } catch (error) {
    log.error('Error when trying to get a text via ID: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send(text);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/:id/info',
    handler,
    schema,
  });
};
