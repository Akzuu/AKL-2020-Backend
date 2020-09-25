const { log } = require('../../lib');
const { Team } = require('../../models');

const schema = {
  description: 'Get captain Ids of given teams',
  summary: 'Get captain Ids',
  tags: ['Team'],
  body: {
    type: 'object',
    required: ['teamIdArray'],
    properties: {
      teamIdArray: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['5eb91490aafd6c5110fd338d'],
      },
    },
  },
};

const handler = async (req, reply) => {
  let teams;
  try {
    teams = await Team.find({
      _id: { $in: req.body.teamIdArray },
    });
  } catch (error) {
    log.error('Error finding a team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (teams.length < 1) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not found',
      message: 'Team not found',
    });
    return;
  }

  const captainIdArray = teams.map(team => team.captain);
  reply.send(captainIdArray);
};

module.exports = {
  method: 'POST',
  url: '/get-captains',
  schema,
  handler,
};
