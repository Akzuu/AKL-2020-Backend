const { log, sendEmailVerification } = require('../../lib');
const { User } = require('../../models');

const schema = {
  description: 'Create new user for the service',
  summary: 'Create user',
  tags: ['User'],
  body: {
    type: 'object',
    required: ['username', 'password', 'email'],
    properties: {
      username: {
        type: 'string',
        minLenght: 3,
      },
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
      password: {
        type: 'string',
        minLength: 8,
      },
      steamRegistrationToken: {
        type: 'string',
        description: 'Send this token to complete registration process via steam',
      },
    },
  },
  response: {
    201: {
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

// TODO: Rewrite this :D
const handler = async (req, reply) => {
  const payload = req.body;
  payload.roles = ['player', 'unConfirmedEmail'];
  payload.registrationComplete = true;

  let user;

  // Check steamRegistrationToken and check if given email can be found from the
  // database. If so, merge accounts
  if (req.body.steamRegistrationToken) {
    req.raw.headers.authorization = `Bearer ${req.body.steamRegistrationToken}`;

    let authPayload;
    try {
      authPayload = await req.jwtVerify();
    } catch (error) {
      log.error('Error validating steam registration token! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    if (!authPayload.steamRegistrationToken) {
      reply.status(403).send({
        status: 'ERROR',
        error: 'Forbidden',
        message: 'Invalid steamRegistrationToken',
      });
      return;
    }

    try {
      user = await User.findOne({
        email: req.body.email,
      });
    } catch (error) {
      log.error('Error when trying to find user!', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    // If user exists, stop the process
    if (user) {
      reply.status(403).send({
        status: 'ERROR',
        error: 'Forbidden',
        message: 'Please use steam account linking to link your account to steam!',
      });
      return;
    }

    try {
      user = await User.findByIdAndUpdate(authPayload._id, payload, {
        new: true,
      });
    } catch (error) {
      log.error('Error when trying to update existing steam account! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
  }

  if (!user) {
    try {
      user = await User.create(payload);
    } catch (error) {
      log.error('Error when trying to create user! ', { error, body: req.body });
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }
  }

  let accessToken;
  let refreshToken;
  try {
    accessToken = await reply.jwtSign({
      _id: user._id,
      roles: user.roles,
    }, {
      expiresIn: '10min',
    });

    refreshToken = await reply.jwtSign({
      _id: user._id,
    }, {
      expiresIn: '2d',
    });
  } catch (err) {
    log.error('Error creating tokens!', err);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }


  if (user.roles.find(role => role === 'unConfirmedEmail')) {
    try {
      await sendEmailVerification(user, reply);
    } catch (error) {
      log.error('Error sending an email! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
        message: 'Sending email failed, but account creation was complete.',
      });
      return;
    }
  }

  reply.status(201).send({
    status: 'CREATED',
    accessToken,
    refreshToken,
  });
};

module.exports = {
  method: 'POST',
  url: '/create',
  schema,
  handler,
};
