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
  let authPayload;
  if (req.raw.headers.authorization) {
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      authPayload = undefined;
    }
  }

  let season;
  try {
    season = await Season.findOne({
      _id: req.params.seasonId,
    })
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

  // Show applications for moderators and admins
  if (authPayload.roles && (authPayload.roles.includes('moderator')
  || authPayload.roles.includes('admin'))) {
    reply.send(season);
    return;
  }

  // Check if team already applied for the season
  let alreadyApplied = false;
  if (season.applications && String(season.applications).includes(String(authPayload._id))
  ) {
    alreadyApplied = true;
  }

  const payload = {
    challonge: season.challonge,
    teams: season.teams,
    hidden: season.hidden,
    acceptsParticipants: season.acceptsParticipants,
    seasonEnded: season.seasonEnded,
    _id: season._id,
    seasonName: season.seasonName,
    seasonNumber: season.seasonNumber,
    division: season.division,
    informationText: season.informationText,
    year: season.year,
    game: season.game,
    alreadyApplied,
  };

  reply.send(payload);
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/:seasonId/info',
    handler,
    schema,
  });
};
