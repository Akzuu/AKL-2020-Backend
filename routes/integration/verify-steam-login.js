const openid = require('openid');
const config = require('config');
const SteamId = require('steamid');
const { log, createUser } = require('../../lib');
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


/**
 * This endpoint is used by steam openid when it redirects user from
 * steamcommunity login. So, how does it work?
 *
 * First we verify that the user actually came from steam openid endpoint
 * and we also make sure that the user authenticated there. After that
 * we parse steamid64 from the url and check if the user already has an account
 * on our service. If true, we just redirect user to frontpage with new token.
 *
 * If the user is using our service for the first time, we must create account.
 * We can only use the data we get from steam web api, so the registration will
 * not be complete, the user must fill in a form with email etc after this
 * process. After that, user can use the website like normal user should be able.
 * @param {*} req
 * @param {*} reply
 */
const handler = async (req, reply) => {
  relyingParty.verifyAssertion(req.raw.url, async (error, result) => {
    if (error || !result.authenticated) {
      log.error('Error validating assertion! ', error);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    let steamID64;
    try {
      [, steamID64] = steamIdRegex.exec(result.claimedIdentifier);

      // Validate id, just in case my RegExp fails or smth :D
      const sid = new SteamId(steamID64);
      if (!sid.isValid) throw new Error('Invalid SteamId');
    } catch (err) {
      log.error('Error matching regex! ', err);
      reply.redirect('/integration/steam/login/failed');
      return;
    }

    let user;
    try {
      user = await User.findOne({
        'steam.steamID': steamID64,
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
        token = await reply.jwtSign({
          _id: user._id,
          registrationComplete: user.registrationComplete,
          steamID64,
        });
      } catch (err) {
        log.error('Error creating token!', error);
        reply.redirect('/integration/steam/login/failed');
        return;
      }

      reply.send({ status: 'OK', token });
      return;
    }

    // Start account creation process
    let _id;
    try {
      [_id] = await createUser(steamID64);
    } catch (err) {
      log.error('Unexpected error while trying to create user! ', error);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    let token;
    try {
      token = await reply.jwtSign({
        _id,
        registrationComplete: false,
        steamID64,
      }, {
        expiresIn: '10min',
      });
    } catch (err) {
      log.error('Error creating token!', err);
    }

    reply.status(201).send({ status: 'CREATED', token });
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login/verify',
  schema,
  handler,
};
