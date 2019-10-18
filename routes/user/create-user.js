const { log } = require('../../lib');
const { User } = require('../../models');
const { userJSON } = require('../../json');

const schema = {
  description: 'Create new user for the service',
  summary: 'Create user',
  tags: ['User'],
  body: userJSON,
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        token: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  // Generate JWT token
  let token;
  try {
    token = await reply.jwtSign({ userName: req.body.userName });
  } catch (error) {
    log.error('Error creating token!', error);
  }

  // Pass token to body, so it will be saved to database
  if (token) {
    req.body.tokens = [{ token }];
  }

  let user;
  try {
    user = await User.create(req.body);
  } catch (error) {
    log.error('Error when trying to create user! ', { error, body: req.body });
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  /**
   * This if should never catch, because fastify makes sure req.body is valid
   * and User.create should throw if it is unable to create database entry.
   *
   * But well, better safe than sorry.
   */
  if (!user) {
    log.error('Make sure the given information is valid!', req.body);
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      message: 'Make sure the given information is valid!',
    });
    return;
  }

  reply.send({ status: 'OK', token });
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
