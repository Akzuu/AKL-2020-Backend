const { log } = require('./../lib');
const { Team } = require('../../models');

const schema = {
  description: 'Delete a team from the service. Requires authentication',
  summary: 'Delete a team',
  tags: ['Team'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
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
  // First verify that user has a valid token
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

  //Make sure user's token is for that user
  let userFound;
  try {
    userFound = await userFound.findOne({
      _id: req.params.id,
      userName,
      'tokens.token': token,
    });
  } catch (error) {
    log.error('Not able to find user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  // If user was not found, then there is a missmatch between the user and the token
  // One could say there is something fishy going on..
  if (!userFound) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
  }

  done()
};

const handler = async (req, reply) => {
  let team;
  try {
    team = await Team.findOneAndDelete({ _id: req.params.id });
  } catch (error) {
    log.error('Error when trying to delete team! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!team) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not found',
      message: 'Team not found',
    });
    return;
  }

  reply.send()
}