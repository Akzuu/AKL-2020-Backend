const { log } = require('../../lib');
const { User } = require('../../models');

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

const handler = async (req, reply) => {
  try {
    await User.create(req.body);
  } catch (error) {
    log.error(error);
    reply.status(500).send();
  }

  reply.send({ status: 'OK' });
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
