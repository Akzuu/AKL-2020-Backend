const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: `Get multiple seasons. Can be used to poll seasons for one part of
  the site with location query param. E.g. location could be /rules`,
  summary: 'Get seasons',
  tags: ['Season'],
  query: {
    type: 'object',
    properties: {
      showHidden: {
        type: 'boolean',
        description: 'returns hidden seasons if set to true',
        default: false,
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
      game: {
        type: 'string',
        description: 'Filter returned seasons using the game name',
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
  const {
    page, pageSize, showHidden, game,
  } = req.query;
  let seasons;

  const findParams = {
    hidden: showHidden || false,
    game: game || /.*/g,
  };

  try {
    seasons = await Season.find(findParams, {
      applications: 0,
      challongeURI: 0,
      createdAt: 0,
      updatedAt: 0,
      __V: 0,
      informationText: 0,
      hidden: 0,
      teams: 0,
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

  reply.send(seasons);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/all',
    handler,
    schema,
  });
};
