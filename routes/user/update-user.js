const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Update users info. Requires authorization',
  summary: 'Update user',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      userName: {
        type: 'string',
        min: 1,
      },
      generalInfo: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
          },
          surname: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
          guild: {
            type: 'string',
          },
          university: {
            type: 'string',
          },
        },
      },
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
        type: 'string',
        min: 8,
      },
      newPassword: {
        type: 'string',
        min: 8,
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
    log.error('Not able to find user!', error);
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
    user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
  } catch (error) {
    log.error('Error when trying to update user! ', error);
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
  method: 'PATCH',
  url: '/:id/update',
  schema,
  handler,
  preHandler,
};
