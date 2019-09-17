const schema = {
  preValidation: 'authentication',
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
  reply.send();
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
