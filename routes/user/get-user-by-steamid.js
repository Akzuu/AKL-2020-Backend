const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Get a single user using a steamid64',
  summary: 'Get user by steamid64.',
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
    }, {
      password: 0, // Do not return password
      'riotGames.encryptedSummonerId': 0,
    })
      .populate('currentTeams', 'teamName')
      .populate('previousTeams', 'teamName');
  } catch (error) {
    log.error('Not able to find the user!', error);
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

  reply.send({
    username: user.username,
    guild: user.guild,
    university: user.university,
    currentTeams: user.currentTeams,
    previousTeams: user.previousTeams,
    steam: {
      userName: user.steam.userName,
      steamID: user.steam.steamID,
      steamID64: user.steam.steamID64,
      avatar: user.steam.avatar,
      profileUrl: user.steam.profileUrl,
    },
    riotGames: {
      username: user.riotGames.username,
      role: user.riotGames.role,
      rank: user.riotGames.rank,
    },
  });
};

module.exports = {
  method: 'GET',
  url: '/steamid64/:steamID64',
  schema,
  handler,
};
