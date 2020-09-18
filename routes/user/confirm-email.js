const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Confirms email',
  summary: 'Cpnfirm email',
  tags: ['User'],
  query: {
    type: 'object',
    properties: {
      token: {
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
  req.raw.headers.authorization = `Bearer ${req.query.token}`;
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Verifying the confirmation token failed!',
    });
    return;
  }

  let user;
  try {
    user = await User.findById(authPayload._id);
  } catch (error) {
    log.error('Error finding user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'User not found!',
    });
  } else if (user.emailConfirmed) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Reqeust',
      message: 'Email already confirmed!',
    });
  }

  // Update components
  const updatePayload = {
    emailConfirmed: true,
    $pull: { roles: 'unConfirmedEmail' },
  };

  try {
    await User.findByIdAndUpdate(authPayload._id, updatePayload);
  } catch (error) {
    log.error('Error updating user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  reply.send({
    status: 'OK',
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/confirm',
    handler,
    schema,
  });
};
