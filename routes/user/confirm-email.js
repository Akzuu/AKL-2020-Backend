const config = require('config');
const { log } = require('../../lib');
const { User } = require('../../models');

const REDIRECT_URI = config.get('loginRedirectUri');

const schema = {
  description: 'Completes Users registration. Requires authorization',
  summary: 'Complete registration process',
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
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Internal Server Error"`);
    return;
  }

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: authPayload._id,
      emailConfirmed: false,
    }, {
      emailConfirmed: true,
      roles: ['player'],
    });
  } catch (error) {
    log.error('Error updating user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  if (!user) {
    reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Bad Request"&message="Email already confirmed!"`);
  }

  reply.redirect(`${REDIRECT_URI}?status=OK`);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/confirm',
    handler,
    schema,
  });
};
