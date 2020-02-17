const { log } = require('../../lib');
const { User } = require('../../models');


const schema = {
  description: 'Logout user from the service',
  summary: 'Logout',
  tags: ['integration'],
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

const handler = async (req, reply) => {
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

  let userFound;
  try {
    userFound = await User.findOneAndUpdate({
      _id: req.params.id,
      userName,
      'tokens.token': token,
    }, {
      $pull: { tokens: { token } },
    });
  } catch (error) {
    log.error('Not able to find user!', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
  }

  if (!userFound) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  reply.send({ status: 'OK' });
};


module.exports = {
  method: 'POST',
  url: '/:id/logout',
  schema,
  handler,
};
