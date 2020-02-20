const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Completes Users registration. Requires authorization',
  summary: 'Complete registration process',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['password', 'email'],
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
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
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
        token: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  let user;

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

  req.body.registrationComplete = true;
  req.body.roles = ['player'];

  try {
    user = await User.findOneAndUpdate({ _id, registrationComplete: false }, req.body, {
      runValidators: true,
    });
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

  // Generate new, full expiration time JWT token
  let token;
  try {
    token = await reply.jwtSign({
      _id: user._id,
      roles: user.roles,
      steamID64: user.steam.steamID64,
    });
  } catch (error) {
    log.error('Error creating token!', error);
  }

  reply.send({ status: 'OK', token });
};

module.exports = {
  method: 'PATCH',
  url: '/register/complete',
  schema,
  handler,
};
