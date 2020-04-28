const { log } = require('../../lib');
const { Season } = require('../../models');
const { getCaptainEmails } = require('../../lib');

const schema = {
  description: 'Send email to all captains. Moderator / Admin rights required',
  summary: 'Send email to captains',
  tags: ['Season'],
  params: {
    type: 'object',
    properties: {
      seasonId: {
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

const handler = async (req, reply) => {
  if (!req.auth.jwtPayload.roles.includes('admin')
  && !req.auth.jwtPayload.roles.includes('moderator')) {
    reply.status(401).send({
      status: 'ERROR',
      error: 'Unauthorized',
      message: 'Only admin / moderator can send email to all captains!',
    });
    return;
  }

  let emails;
  try {
    emails = await getCaptainEmails(req.params.seasonId);
  } catch (error) {
    log.error('Error finding emails for season! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

};

module.exports = async function (fastify) {
  fastify.route({
    method: 'POST',
    url: '/:seasonId/sendEmail',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
