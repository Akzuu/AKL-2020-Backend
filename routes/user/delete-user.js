const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Create user',
  summary: 'Create new user for the service',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
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

const preHandler = async (req, reply, done) => {
  // TODO: Make sure user can only delete him/herself
  const token = req.raw.headers.authorization;
  try {
    await req.jwtVerify();
  } catch (error) {
    log.error('Error validating token!', { error, token });
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    return;
  }

  done();
};

const handler = async (req, reply) => {
  let user;
  try {
    user = await User.findOneAndDelete({ _id: req.params.id });
  } catch (error) {
    log.error('Error when trying to create user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'User not found.',
    });
    return;
  }

  reply.send({ status: 'OK' });
};

module.exports = {
  method: 'DELETE',
  url: '/:id/delete',
  schema,
  handler,
  preHandler,
};
