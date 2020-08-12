const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: `Get one season resource via :id. 
  Will show applications, if the user has the role "admin" or "moderator"`,
  summary: 'Get season',
  tags: ['Season'],
  params: {
    type: 'object',
    properties: {
      seasonId: {
        type: 'string',
      },
    },
  },
  response: {
    // 200: {
    //   type: 'object',
    //   properties: {
    //     status: {
    //       type: 'string',
    //     },
    //   },
    // },
  },
};

const handler = async (req, reply) => {
  let projection = {
    applications: 0,
  };

  if (req.raw.headers.authorization) {
    let authPayload;
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      log.error('Error validating token! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
    }

    // Show applications for moderators and admins
    if (authPayload.roles && (authPayload.roles.includes('moderator')
        || authPayload.roles.includes('admin'))) {
      projection = {};
    }
  }


  let season;
  try {
    season = await Season.findOne({
      _id: req.params.seasonId,
    },
    projection)
      .populate('teams', 'teamName')
      .populate('applications.team');
  } catch (error) {
    log.error('Error when trying to get a season via ID: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  reply.send(season);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/:seasonId/info',
    handler,
    schema,
  });
};
