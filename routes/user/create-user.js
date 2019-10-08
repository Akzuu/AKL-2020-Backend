const { log } = require('../../lib');
const { User } = require('../../models');
const { userJSON } = require('../../json');

const schema = {
  description: 'Create user',
  summary: 'Create new user for the service',
  tags: ['User'],
  body: userJSON,
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

const preHandler = (req, reply, done) => {
  done();
};

const handler = async (req, reply) => {
  try {
    await User.create(req.body);
  } catch (error) {
    log.error('Error when trying to create user! ', error);
    reply.status(500).send();
  }

  reply.send({ status: 'OK' });
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
  preHandler,
};
