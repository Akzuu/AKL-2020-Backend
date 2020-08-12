const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: `Get a single user. Returns slightly different
                results based on authentication. Most info will be returned
                for user checking his/hers own account. Least will be given
                to random users checking profiles`,
  summary: 'Get user.',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  // response: {
  //   200: {
  //     type: 'object',
  //     properties: {
  //       status: {
  //         type: 'string',
  //       },
  //     },
  //   },
  // },
};

const handler = async (req, reply) => {
  let authPayload;

  // If there are authorization headers, check them
  if (req.raw.headers.authorization) {
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      log.error('Error validating token! ', error);
      reply.status(401).send({
        status: 'ERROR',
        error: 'Unauthorized',
        message: 'Please authenticate',
      });
      return;
    }
  }

  let user;
  try {
    user = await User.findOne({
      _id: req.params.id,
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


  // If user is checking his/hers own account
  if (authPayload && (String(user._id) === authPayload._id
  || (authPayload.roles && authPayload.roles.includes('admin')))) {
    reply.send(user);
    return;
  }

  // If authenticated user is checking someones account
  if (authPayload) {
    reply.send({
      id: req.params.id,
      username: user.username,
      firstName: user.firstName,
      surname: user.surname,
      age: user.age,
      guild: user.guild,
      university: user.university,
      currentTeams: user.currentTeams,
      previousTeams: user.previousTeams,
      steam: {
        username: user.steam.username,
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
    return;
  }

  // If unregistered unauthenticated user is checking someones accounts
  reply.send({
    id: req.params.id,
    username: user.username,
    guild: user.guild,
    university: user.university,
    currentTeams: user.currentTeams,
    previousTeams: user.previousTeams,
    steam: {
      username: user.steam.userName,
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
  url: '/id/:id',
  schema,
  handler,
};
