const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: `Get a single team. Returns slightly different
                results based on authentication. Most info will be returned
                for user checking a team (s)he belongs to. Least info will be returned
                to random users checking teams.`,
  summary: 'Get a team.',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      teamId: {
        type: 'string',
      },
    },
  },

  /* response: {
    200: {
      type: 'object',
      propertis: {
        status: {
          type: 'string',
        },
      },
    },
  }, */
};

const handler = async (req, reply) => {
  let authPayload;

  // Check authorization headers
  if (req.raw.headers.authorization) {
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      authPayload = undefined;
    }
  }

  let team;
  try {
    team = await Team.findOne({
      _id: req.params.teamId,
    })
      .populate('captain', 'username')
      .populate('members', ['username', 'steam.steamID64'])
      .populate('applications.user', 'username')
      .populate('seasons', ['seasonName', 'seasonNumber', 'division', 'year', 'seasonEnded']);
  } catch (error) {
    log.error('Not able to find the team!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  if (!team) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Team not found.',
    });
    return;
  }

  // Own team
  if (authPayload
    && team.members
    && team.members.find(member => String(member._id) === String(authPayload._id))) {
    reply.send(team);
    return;
  }

  // Check if user already applied for the team
  let alreadyApplied = false;
  if (authPayload && team.applications
    && String(team.applications).includes(String(authPayload._id))) {
    alreadyApplied = true;
  }

  // Other users
  reply.send({
    _id: team._id,
    teamName: team.teamName,
    abbreviation: team.abbreviation,
    introductionText: team.introductionText,
    captain: team.captain,
    members: team.members,
    seasons: team.seasons,
    rank: team.rank,
    game: team.game,
    alreadyApplied,
  });
};

module.exports = {
  method: 'GET',
  url: '/:teamId/info',
  schema,
  handler,
};
