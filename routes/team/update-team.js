const { log } = require('../../lib');
const { User } = require('../../models');
const { Team } = require('../../models');

const schema = {
  description: 'Update teams info. Requires authorization',
  summary: 'Update team info.',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    // required: ['password'],
    properties: {
      teamName: {
        type: 'string',
        min: 3,
      },
      abbreviation: {
        type: 'string',
        min: 1,
      },
      introductionText: {
        type: 'string',
      },
      application: {
        type: 'string',
      },
      captain: {
        type: 'string',
      },
      active: {
        type: 'boolean',
      },
      rank: {
        type: 'string',
        enum: [
          'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
          'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
          'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
          'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
          'Supreme Master First Class', 'Global Elite',
        ],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
      },
    },
  },
};

const preHandler = async (req, reply, done) => {
  // Verify that there is a valid token
  let payload;
  let token;
  try {
    payload = await req.jwtVerify();
    token = req.raw.headers.authorization.replace('Bearer ', '');
  } catch (error) {
    log.error('Error validating token! ', error);
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Please authenticate',
    });
    return;
  }

  const { userName } = payload;

  // Make sure this token is for the captain of the team
  try {
    const team = Team.findOne({
      _id: req.params.id,
    }).populate('captain');

    const user = await User.findOne({
      userName: 'team.captain',
      // 'tokens.token': token,
    });

    if (userName !== user.userName) {
      throw new Error({ msg: 'User not captain' });
    }
  } catch (error) {
    log.error('Not able to find a team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  done();
};

const handler = async (req, reply) => {
  let team;
  try {
    team = await Team.findOneAndUpdate({ _id: req.params.id }, req.body);
  } catch (error) {
    log.error('Error when trying to update team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!team) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
      message: 'Team not found',
    });
    return;
  }

  reply.send({ status: 'OK' });
};


module.exports = {
  method: 'PATCH',
  url: '/:id/update',
  schema,
  handler,
  preHandler,
};
