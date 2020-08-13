const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: 'Get all teams',
  summary: 'Get all teams.',
  tags: ['Team'],
  query: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Paging starts at zero',
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
  // TODO: Response
};

const handler = async (req, reply) => {
  const { page, pageSize, game } = req.query;

  const findParams = {
    game: game || /.*/g,
  };

  let teams;
  try {
    teams = await Team
      .find(findParams, {
        applications: 0,
        hidden: 0,
      })
      .populate('captain', 'username')
      .populate('members', 'username')
      .limit(pageSize)
      .skip(pageSize * page);
  } catch (error) {
    log.error('Not able to find teams!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  reply.send(teams);
};

module.exports = {
  method: 'GET',
  url: '/all',
  schema,
  handler,
};
