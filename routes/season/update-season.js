const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: 'Update season resource',
  summary: 'Update season',
  tags: ['Season'],
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
    properties: {
      division: {
        type: 'string',
      },
      informationText: {
        type: 'string',
      },
      year: {
        type: 'number',
      },
      hidden: {
        type: 'boolean',
      },
      challongeURI: {
        type: 'string',
        format: 'uri',
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

  if (Object.keys(req.body).length === 0) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Atleast one change is required',
    });
    return;
  }

  let season;
  try {
    season = await Season.findOneAndUpdate({
      _id: req.params.id,
    },
    req.body,
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error deleting season: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!season) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
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
    url: '/:id/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
