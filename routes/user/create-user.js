const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Create new user for the service. ALL Endpoint',
  summary: 'Create user. ALL Endpoint',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['username', 'password', 'email', 'gameInfo'],
    properties: {
      username: {
        type: 'string',
        minLenght: 3,
      },
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
        minLength: 8,
      },
      gameInfo: {
        type: 'object',
        required: ['username'],
        properties: {
          riotUsername: {
            type: 'string',
          },
          role: {
            type: 'string',
          },
          rank: {
            type: 'string',
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  let user;

  const payload = req.body;
  payload.roles = ['player'];
  payload.registrationComplete = true;

  try {
    user = await User.create(payload);
  } catch (error) {
    log.error('Error when trying to create user! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  let accessToken;
  let refreshToken;
  try {
    accessToken = await reply.jwtSign({
      _id: user._id,
      roles: user.roles,
    }, {
      expiresIn: '10min',
    });

    refreshToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (err) {
    log.error('Error creating tokens!', err);
    log.error('Error when trying to create tokens! ', err);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.status(201).send({
    status: 'CREATED',
    accessToken,
    refreshToken,
  });
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
