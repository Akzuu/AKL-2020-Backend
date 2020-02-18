const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Delete user from the service. Requires authorization',
  summary: 'Delete user',
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

const handler = async (req, reply) => {
  // First we verify that user has a valid token
  let payload;
  try {
    payload = await req.jwtVerify();
  } catch (error) {
    log.error('Error validating token! ', error);
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    return;
  }

  const { _id } = payload;

  // Make sure user is trying to remove his own account
  // TODO: Let admins to remove users
  if (_id !== req.params.id) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  let user;
  try {
    user = await User.findOneAndDelete({
      _id: req.params.id,
    });
  } catch (error) {
    log.error('Error when trying to delete user! ', error);
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
};
