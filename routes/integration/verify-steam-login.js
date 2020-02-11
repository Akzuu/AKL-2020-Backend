const openid = require('openid');
const config = require('config');
const SteamId = require('steamid');
const { log } = require('../../lib');
const { User } = require('../../models');

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
  relyingParty.verifyAssertion(req.raw.url, async (error, result) => {
    if (error || !result.authenticated) {
      log.error('Error validating assertion! ', error);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    let steamId64;
    try {
      [, steamId64] = steamIdRegex.exec(result.claimedIdentifier);

      // Validate id, just in case my RegExp fails or smth :D
      const sid = new SteamId(steamId64);
      if (!sid.isValid) throw new Error('Invalid SteamId');
    } catch (err) {
      log.error('Error matching regex! ', err);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    let user;
    try {
      user = await User.findOne({
        'steam.steamID': steamId64,
      });
    } catch (err) {
      log.error('Error when trying to look for user! ', error);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    // User already has an account, so just log in and redirect to frontpage
    if (user) {
      let token;

      try {
        token = await reply.jwtSign({ userName: user.userName });
      } catch (err) {
        log.error('Error creating token!', error);
        reply.redirect('/integration/steam/login/failed');
        return;
      }

      reply.send({ status: 'OK', token });
      return;
    }

    // Start account creation process
    try {
      
    } catch (error) {
      
    }
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login/verify',
  schema,
  handler,
};
