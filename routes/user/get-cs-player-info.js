const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Get users roles by steamId',
  summary: 'Get roles by steamId',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      steamID64: {
        type: 'string',
      },
    },
  },
};

const handler = async (req, reply) => {
  let user;
  try {
    user = await User.findOne({
      'steam.steamID64': req.params.steamID64,
    })
      .populate('currentTeams');
  } catch (error) {
    log.error('Not able to find the user! ', error);
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

  let isAdmin = false;
  if (user.roles.includes('admin') || user.roles.includes('moderator')) {
    isAdmin = true;
  }

  const csTeam = user.currentTeams.find(team => team.game === 'csgo');
  if (!csTeam) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'User does not belong to a CS team',
    });
    return;
  }

  reply.send({
    isAdmin,
    teamName: csTeam.teamName,
    teamAbbreviation: csTeam.abbreviation,
  });
};

module.exports = {
  method: 'GET',
  url: '/get-roles/:steamID64',
  schema,
  handler,
};
