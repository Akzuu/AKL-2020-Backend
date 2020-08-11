const openid = require('openid');
const config = require('config');
const { log } = require('../../lib');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');
const FRONTEND_STEAM_CALLBACK_URL = config.get('frontendSteamCallbackUri');

const schema = {
  description: 'Login user with Steam OpenID',
  summary: 'Login with Steam',
  tags: ['Integration'],
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


const relyingParty = new openid.RelyingParty(
  FRONTEND_STEAM_CALLBACK_URL, // Callback url
  null, // Realm (optional, specifies realm for OpenID authentication)
  true, // Use stateless verification, must be true with Steam
  false, // Strict mode
  [], // List of extensions to enable and include
);

const handler = async (req, reply) => {
  relyingParty.authenticate('https://steamcommunity.com/openid', false, (error, authUrl) => {
    if (error) {
      log.error(`Authentication failed: ${error.message}`);
      reply.send(`Authentication failed: ${error.message}`);
    } else if (!authUrl) {
      reply.send('Authentication failed');
    } else {
      reply.send({
        url: authUrl,
        backendCallbackUrl: `${HOST}${ROUTE_PREFIX}/integration/steam/login/verify`,
      });
    }
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login',
  schema,
  handler,
};
