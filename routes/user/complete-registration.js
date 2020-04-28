const config = require('config');
const { log, sendMail } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

const schema = {
  description: 'Completes Users registration. Requires authorization',
  summary: 'Complete registration process',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['username', 'password', 'email'],
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
    },
  },
  response: {
    200: {
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
  const payload = req.body;

  payload.roles = ['player', 'unConfirmedEmail'];
  payload.registrationComplete = true;

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: req.auth.jwtPayload._id,
      registrationComplete: false,
    },
    payload,
    {
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

  // Generate new token with correct roles
  let accessToken;
  let refreshToken;
  try {
    accessToken = await reply.jwtSign({
      _id: user._id,
      roles: user.roles,
      steamID64: user.steam.steamID64,
    }, {
      expiresIn: '10min',
    });
    refreshToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (error) {
    log.error('Error creating token!', error);
  }

  reply.send({ status: 'OK', accessToken, refreshToken });


  // Send email confirmation
  let confirmToken;
  try {
    confirmToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (error) {
    log.error('Error when trying to create confirmation token', error);
  }

  try {
    await sendMail(payload.email,
      'Email confirmation',
      `Please click :D ${HOST}${ROUTE_PREFIX}/user/confirm?token=${confirmToken}`);
  } catch (error) {
    log.error('Error when trying to send an email', error);
  }
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/register/complete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
