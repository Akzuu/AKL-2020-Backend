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
  let team;
  try {
    team = await Team.create(req.body);
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

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
