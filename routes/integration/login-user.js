const { log } = require('../../lib');
const { User } = require('../../models');


const schema = {
  description: 'Login user to the service with normal credentials',
  summary: 'Login with credentials',
  tags: ['Integration'],
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

};


module.exports = {
  method: 'POST',
  url: '/login',
  schema,
  handler,
};
