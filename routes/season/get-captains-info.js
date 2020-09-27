const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: 'Get team captains information. Moderator / Admin rights required',
  summary: 'Get captains info for the season',
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
    //     accessToken: {
    //       type: 'string',
    //     },
    //     refreshToken: {
    //       type: 'string',
    //     },
    //   },
    // },
  },
};

const handler = async (req, reply) => {
  if (!req.auth.jwtPayload.roles.includes('admin')
  && !req.auth.jwtPayload.roles.includes('moderator')) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only admin / moderator can request captains info for the season!',
    });
    return;
  }

  let season;

  try {
    season = await Season.findOne({
      _id: req.params.seasonId,
    })
      .populate({
        path: 'teams',
        populate: {
          path: 'captain',
          model: 'users',
        },
      });
  } catch (error) {
    log.error('Error getting season! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  const infos = [];

  season.teams.forEach((team) => {
    const captainInfo = {
      teamId: team._id,
      teamName: team.teamName,
      captain: {
        id: team.captain._id,
        username: team.captain.username,
        email: team.captain.email,
      },
    };
    infos.push(captainInfo);
  });


  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    infos,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/:seasonId/captains',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
