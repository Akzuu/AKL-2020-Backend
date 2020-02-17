const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: `Get a single team. Returns slightly different
                results based on authentication. Most info will be returned
                for user checking a team (s)he belongs to. Least info will be returned
                to random users checking teams.`,
  summary: 'Get a team.',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  response: {
    /* 200: {
      type: 'object',
      propertis: {
        status: {
          type: 'string',
        },
      },
    }, */
  },
};
// TODO: handler with authentication

module.exports = {
  method: 'GET',
  url: '/:id/info',
  schema,
  // handler,
};
