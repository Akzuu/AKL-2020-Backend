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

const preHandler = async (req, reply, done) => {
  // First we verify that user has a valid token
  let payload;
  let token;
  try {
    payload = await req.jwtVerify();
    token = req.raw.headers.authorization.replace('Bearer ', '');
  } catch (error) {
    log.error('Error validating token! ', error);
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    return;
  }

  const { userName } = payload;

  // Then make sure users token is for that user
  let userFound;
  try {
    userFound = await User.findOne({
      _id: req.params.id,
      userName,
      'tokens.token': token,
    });
  } catch (error) {
    log.error('Not able to remove user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // If user was not found, then there is a missmatch between user and the token
  // One could say that there is something fishy going on..
  if (!userFound) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
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
