const { log } = require('../../lib');
const { Text } = require('../../models');

const schema = {
  description: 'Create new text resource for the site',
  summary: 'Create text resource',
  tags: ['Text'],
  body: {
    type: 'object',
    required: ['location', 'fiText', 'enText'],
    properties: {
      location: {
        type: 'string',
        description: 'Location on site for the text. E.g. "/" would mean frontpage',
      },
      fiText: {
        type: 'string',
        description: 'Text in finnish',
      },
      enText: {
        type: 'string',
        description: 'Text in english',
      },
      hiddenUntil: {
        type: 'string',
        format: 'date-time',
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
  if (!req.auth.jwtPayload.roles.includes('moderator')
  && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  const payload = req.body;

  if (!payload.hiddenUntil) {
    payload.hiddenUntil = Date.now();
  }

  payload.author = req.auth.jwtPayload._id;
  try {
    await Text.create(payload);
  } catch (error) {
    log.error('Error when trying to create text! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};


module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/create',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
