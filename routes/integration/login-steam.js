const { Client } = require('openid-client');
const { log } = require('../../lib');

const schema = {
  description: 'Login user with Steam OpenID',
  summary: 'Login with Steam',
  tags: ['integration'],
  response: {
    // 200: {
    //   type: 'object',
    //   properties: {
    //     status: {
    //       type: 'string',
    //     },
    //   },
    // },
  },
};

const handler = async (req, reply) => {
  // TODO
  console.log('kissa?');
  const something = await Client.
  console.log(something);

  reply.send(something);
};


module.exports = {
  method: 'POST',
  url: '/steam/login',
  schema,
  handler,
};
