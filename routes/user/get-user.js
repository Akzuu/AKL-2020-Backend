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
  let token;
  let authPayload;

  // If there are authorization headers, check them
  if (req.raw.headers.authorization) {
    token = req.raw.headers.authorization.replace('Bearer ', '');

    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      log.error('Error validating token! ', error);
      reply.status(401).send({
        status: 'ERROR',
        error: 'Unauthorized',
        message: 'Please authenticate',
      });
    }
  }

  let user;
  try {
    user = await User.findOne({
      _id: req.params.id,
    }, {
      password: 0, // Do not return password
    });
  } catch (error) {
    log.error('Not able to find user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
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
  if (authPayload && user.userName === authPayload.userName
    && user.tokens.find(tokens => tokens.token === token)) {
    user.tokens = undefined;
    reply.send(user);
    return;
  }

  // If user is checking someones account
  if (authPayload) {
    reply.send({
      userName: user.userName,
      generalInfo: {
        firstname: user.generalInfo.firstname,
        surname: user.generalInfo.surname,
        age: user.generalInfo.age,
        guild: user.generalInfo.guild,
        university: user.generalInfo.university,
      },
      currentTeam: user.currentTeam,
      previousTeams: user.previousTeams,
      avatar: user.avatar,
      steam: {
        steamID64: user.steam.steamID64,
      },
    });
    return;
  }

  // If unregistered unauthenticated user is checking someones accounts
  reply.send({
    userName: user.userName,
    generalInfo: {
      guild: user.generalInfo.guild,
      university: user.generalInfo.university,
    },
    currentTeam: user.currentTeam,
    previousTeams: user.previousTeams,
    avatar: user.avatar,
    steam: {
      steamID64: user.steam.steamID64,
    },
  });
};

module.exports = {
  method: 'GET',
  url: '/:id/info',
  schema,
  handler,
};
