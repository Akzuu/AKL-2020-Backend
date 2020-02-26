const { log } = require('../../lib');
const { Team } = require('../../models');
const { teamJSON } = require('../../json');

const schema = {
  description: 'Create new team for the service',
  summary: 'Create a team',
  tags: ['Team'],
  body: teamJSON,
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

const handler = async (req, reply) => {
  let isAlreadyInTeam;
  let team;
  try {
    isAlreadyInTeam = await Team.findOne({
      members: req.body.jwtPayload._id,
    });
    if (!isAlreadyInTeam) {
      req.body.captain = req.body.jwtPayload._id;
      req.body.members = [req.body.jwtPayload._id];
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

  reply.send({ status: 'OK' });
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
