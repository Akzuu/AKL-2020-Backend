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
    });
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

  reply.send({
    roles: user.roles,
  });
};

module.exports = {
  method: 'GET',
  url: '/get-roles/:steamID64',
  schema,
  handler,
};
