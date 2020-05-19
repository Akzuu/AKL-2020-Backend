const bcrypt = require('bcrypt');
const { log, sendEmailVerification } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Update users info. Requires authorization',
  summary: 'Update user',
  tags: ['User'],
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
      firstName: {
        type: 'string',
      },
      surname: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      guild: {
        type: 'string',
      },
      university: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      oldPassword: {
        type: 'string',
      },
      newPassword: {
        type: 'string',
        minLength: 8,
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
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  if (req.params.id !== req.auth.jwtPayload._id
    && !req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  if (Object.keys(req.body).length === 0) {
    reply.status(400).send({
      status: 'ERROR',
      error: 'Bad Request',
      messsage: 'Atleast one change is required',
    });
    return;
  }

  const payload = req.body;

  if (req.body.newPassword || req.body.email || req.body.oldPassword) {
    if (!req.body.oldPassword) {
      reply.status(400).send({
        status: 'ERROR',
        error: 'Bad Request',
        message: 'Password required when changing password or email',
      });
      return;
    }

    let user;
    try {
      user = await User.findOne({
        _id: req.params.id,
      });
    } catch (error) {
      log.error('Error when trying to find user! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    if (!user) {
      reply.status(404).send({
        status: 'ERROR',
        error: 'Not Found',
      });
      return;
    }

    // eslint-disable-next-line prefer-destructuring
    payload.roles = user.roles;
    if (req.body.email !== user.email) {
      payload.roles.push('unConfirmedEmail');
      payload.emailConfirmed = false;
    }

    const samePassword = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!samePassword) {
      reply.status(400).send({
        status: 'ERROR',
        error: 'Bad Request',
        message: 'Password does not match',
      });
      return;
    }

    if (req.body.newPassword) {
      payload.password = req.body.newPassword;
      delete payload.newPassword;
    }

    delete payload.oldPassword;
  }

  let user;
  try {
    user = await User.findOneAndUpdate({
      _id: req.params.id,
    },
    payload,
    {
      runValidators: true,
    });
  } catch (error) {
    log.error('Error when trying to update user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user) {
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
    });
    return;
  }

  if (req.body.email) {
    // Send verification email
    try {
      await sendEmailVerification(user, reply);
    } catch (error) {
      log.error('Error sending an email! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
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
    url: '/:id/update',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
