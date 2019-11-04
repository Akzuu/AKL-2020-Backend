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
    },
  },
  // TODO: Response
};

const handler = async (req, reply) => {
  const { page, pageSize } = req.query;
  let teams;
  try {
    teams = await Team
      .find({}, {
        abbreviation: 0,
        introductionText: 0,
        application: 0,
        members: 0,
        seasons: 0,
      })
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
