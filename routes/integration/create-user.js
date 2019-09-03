const schema = {
  description: 'Create user',
  summary: 'Create new user for the service',
  tags: ['Integration'],
  response: {
    200: {
      type: 'string',
    },
  },
};

const handler = (req, reply) => {
  reply.send(new Date());
};

module.exports = {
  method: 'GET',
  url: '/user/create',
  schema,
  handler,
};
