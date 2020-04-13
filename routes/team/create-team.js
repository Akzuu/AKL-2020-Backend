const { log } = require('../../lib');
const { Team } = require('../../models');
const { teamJSON } = require('../../json');

const schema = {
  description: 'Create new team for the service',
  summary: 'Create a team',
  tags: ['Team'],
  body: teamJSON,

  /*
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
  */
};

const handler = async (req, reply) => {
  let isAlreadyInTeam;
  try {
    // TODO: This will not work, needs aggregation
    isAlreadyInTeam = await Team.findOne({
      members: req.auth.jwtPayload._id,
    });
  } catch (error) {
    log.error('Error when trying to find an existing team! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  let team;
  try {
    if (!isAlreadyInTeam) {
      req.body.captain = req.auth.jwtPayload._id;
      req.body.members = [req.auth.jwtPayload._id];
      team = await Team.create(req.body);
    } else {
      reply.status(403).send({
        status: 'ERROR',
        error: 'Forbidden',
        message: 'You already belong to a team!',
      });
      return;
    }
  } catch (error) {
    log.error('Error when trying to create team! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  /**
 * This if should never catch, because fastify makes sure req.body is valid
 * and Team.create should throw if it is unable to create database entry.
 *
 * But well, better safe than sorry.
 */
  if (!team) {
    log.error('Make sure the given information is valid!', req.body);
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Make sure the given information is valid!',
    });
    return;
  }

  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/create',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
