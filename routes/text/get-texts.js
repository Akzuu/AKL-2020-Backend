const { log } = require('../../lib');
const { Text } = require('../../models');

const schema = {
  description: `Get multiple texts. Can be used to poll texts for one part of
  the site with location query param. E.g. location could be /rules`,
  summary: 'Get texts',
  tags: ['Text'],
  query: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'Text location. E.g. /rules',
      },
      page: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Paging starts at 0',
      },
      pageSize: {
        type: 'number',
        minimum: 1,
        default: 20,
        description: 'How many will be returned',
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
  const { page, pageSize } = req.query;
  let texts;
  try {
    texts = await Text.find({
      location: req.query.location,
    })
      .limit(pageSize)
      .skip(pageSize * page);
  } catch (error) {
    log.error('Error when trying to get a text via ID: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send(texts);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/all',
    handler,
    schema,
  });
};
