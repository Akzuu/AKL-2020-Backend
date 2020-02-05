const openid = require('openid');
const config = require('config');
const { log } = require('../../lib');

const HOST = config.get('host');

const schema = {
  description: 'Steam callback from openid',
  summary: 'Steam callback',
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

const relyingParty = new openid.RelyingParty(
  `${HOST}/integration/steam/login/verify`, // Callback url
  null, // Realm (optional, specifies realm for OpenID authentication)
  true, // Use stateless verification, must be true with Steam
  false, // Strict mode
  [], // List of extensions to enable and include
);

const steamIdRegex = new RegExp('^https:\/\/steamcommunity.com\/openid\/id\/([1-9]{17})$');

const handler = async (req, reply) => {
  relyingParty.verifyAssertion(req.raw.url, (error, result) => {
    if (error || !result.authenticated) {
      log.error('Error validating assertion! ', error);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    let steamId64;
    try {
      [, steamId64] = steamIdRegex.exec(result.claimedIdentifier);
    } catch (err) {
      log.error('Error matching regex! ', err);
      reply.redirect('/integration/steam/login/failed');
    }


    reply.redirect(`/integration/steam/login/success/${steamId64}`);
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login/verify',
  schema,
  handler,
};
