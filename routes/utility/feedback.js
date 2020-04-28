const { log } = require('../../lib');
const { Feedback } = require('../../models');

const schema = {
  description: 'Feedback endpoint',
  summary: 'Feedback',
  tags: ['Utility'],
  body: {
    type: 'object',
    required: ['subject', 'feedback', 'anonymous'],
    properties: {
      subject: {
        type: 'string',
      },
      feedback: {
        type: 'string',
      },
      anonymous: {
        type: 'boolean',
        description: `False if user wants to give feedback with name,
                      true if user wants to give feedback anonymously`,
      },
      authorStringName: {
        type: 'string',
        description: `If feedback giver has not logged in, 
                      but wants to give feedback unanonymously`,
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
  console.log(req.body);
  let authPayload;
  if (!req.body.anonymous && req.raw.headers.authorization) {
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      log.error('Error validating token! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
    }
  }

  try {
    await Feedback.create({
      subject: req.body.subject,
      feedback: req.body.feedback,
      author: authPayload ? authPayload._id : null,
      authorStringName: req.body.authorStringName,
    });
  } catch (error) {
    log.error('Error when saving feedback! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  reply.send({
    status: 'OK',
  });
};

module.exports = {
  method: 'POST',
  url: '/feedback',
  handler,
  schema,
};
