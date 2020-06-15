const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Get a single user using a riot username',
  summary: 'Get user by riot username.',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      riotUsername: {
        type: 'string',
      },
    },
  },
};

const handler = async (req, reply) => {
  let user;
  try {
    user = await User.findOne({
      'riotGames.username': req.params.riotUsername,
    }, {
      password: 0, // Do not return password
      'riotGames.encryptedSummonerId': 0,
    });
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
  url: '/riot-username/:riotUsername',
  schema,
  handler,
};
