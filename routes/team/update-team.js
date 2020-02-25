const { log } = require('../../lib');
const { Team } = require('../../models');
// const { User } = require('../../models');

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

/*
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
  let teamFound;
  try {
    teamFound = await Team.findOne({
      _id: req.params.id,
    }).populate({ path: 'captain', model: User });
    const user = await User.findOne({
      _id: teamFound.captain,
      'tokens.token': token,
    });
    if (!user) {
      throw new Error('User does not match with the captains token');
    }

    if (userName !== user.userName) {
      throw new Error('User is not the captain');
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
*/

const handler = async (req, reply) => {
  let team;
  try {
    team = await Team.findOneAndUpdate({
      _id: req.params.id,
      captain: req.body.jwtPayload._id,
    }, req.body,
    {
      runValidators: true,
    });
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


module.exports = async function (fastify) {
  fastify.route({
    method: 'PATCH',
    url: '/:id/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
