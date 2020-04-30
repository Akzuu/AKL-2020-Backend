const config = require('config');
const { log } = require('../../lib');
const { User } = require('../../models');

const REDIRECT_URI = `${config.get('loginRedirectUri')}/user/reset-password`;

const schema = {
  description: 'Nullifies users password for reseting. Requires authorization',
  summary: 'Nullifies password for password reset',
  tags: ['User'],
  query: {
    type: 'object',
    properties: {
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
      },
    },
  },
};

const handler = async (req, reply) => {
  req.raw.headers.authorization = `Bearer ${req.query.resetToken}`;
  let authPayload;
  try {
    authPayload = await req.jwtVerify();
  } catch (error) {
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Internal Server Error"`);
    return;
  }

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
    }, {
      $set: { password: null },
      $push: { roles: 'passwordReset' },
    });
  } catch (error) {
    log.error('Error nullifying password! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }
  if (!user) {
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Bad Request"&message="User not found!"`);
    return;
  }

  reply.redirect(`${REDIRECT_URI}?status=OK&resetToken=${req.query.resetToken}`);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/nullify-password',
    handler,
    schema,
  });
};
