const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Reset users password. Requires authorization',
  summary: 'Reset password',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['newPassword'],
    properties: {
      newPassword: {
        type: 'string',
        minLength: 8,
      },
      resetToken: {
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
  // Check the user has valid temporary resetToken
  req.raw.headers.authorization = `Bearer ${req.body.resetToken}`;
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    log.error('Error verifying jwtToken! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  let user;

  // Find user, set new password and remove reset role
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
      roles: 'passwordReset',
      resetToken: req.body.resetToken,
    }, {
      password: req.body.newPassword,
      $pull: { roles: 'passwordReset' },
      resetToken: null,
    },
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error finding the user! ', error);
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
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send({
    status: 'OK',
    accessToken,
    refreshToken,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/reset-password',
    handler,
    schema,
  });
};
