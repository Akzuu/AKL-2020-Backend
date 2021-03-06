const { log } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Get all users',
  summary: 'Get all users.',
  tags: ['User'],
  query: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        default: 0,
        description: 'Paging starts at 0',
      },
      pageSize: {
        type: 'number',
        minimum: 1,
        default: 20,
        description: 'How many will be returned',
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
  const { page, pageSize } = req.query;
  let users;
  try {
    users = await User
      .find({}, {
        password: 0,
        firstName: 0,
        surname: 0,
        age: 0,
        email: 0,
        previousTeams: 0,
        'steam.steamID': 0,
        'steam.avatar': 0,
        'riotGames.rank': 0,
        'riotGames.encryptedSummonerId': 0,
        registrationComplete: 0,
        emailConfirmed: 0,
        roles: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      })
      .limit(pageSize)
      .skip(pageSize * page);
  } catch (error) {
    log.error('Not able to find users!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  reply.send(users);
};

module.exports = {
  method: 'GET',
  url: '/all',
  schema,
  handler,
};
