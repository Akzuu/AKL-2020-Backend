const openid = require('openid');
const config = require('config');
const SteamId = require('steamid');
const { log, createUser } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');

const schema = {
  description: `This endpoint is used by steam openid when it redirects 
  user from steamcommunity login. It may return four statuses.
  
  1. Code 200: user has an account and should be redirected to frontpage with new token
  2. Code 201: user used the service for the first time and should complete the registration process
  3. Code 401: openid login failed. User did not authenticate with steam or smth failed somewhere
  4. Code 500: Something went wrong, error has been logged to backend service`,
  summary: 'Steam openid callback',
  tags: ['Integration'],
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
    401: {
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
    500: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
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
      reply.status(401).send({
        status: 'ERROR',
        error: 'Unauthorized',
      });
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
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    let user;
    try {
      user = await User.findOne({
        'steam.steamID64': steamID64,
      });
    } catch (err) {
      log.error('Error when trying to look for user! ', err);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    // User already has an account, so just log in and redirect to frontpage
    if (user) {
      let accessToken;
      let refreshToken;
      try {
        accessToken = await reply.jwtSign({
          _id: user._id,
          roles: user.roles,
          steamID64,
        }, {
          expiresIn: '10min',
        });

        refreshToken = await reply.jwtSign({
          _id: user._id,
        }, {
          expiresIn: '2d',
        });
      } catch (err) {
        log.error('Error creating token!', err);
        reply.status(500).send({
          status: 'ERROR',
          error: 'Internal Server Error',
        });
        return;
      }

      reply.send({ status: 'OK', accessToken, refreshToken });
      return;
    }

    // Start account creation process
    let id;
    try {
      id = await createUser(steamID64);
    } catch (err) {
      log.error('Unexpected error while trying to create user! ', err);
      reply.status(500).send({
        status: 'ERROR',
        error: 'Internal Server Error',
      });
      return;
    }

    let accessToken;
    let refreshToken;
    try {
      accessToken = await reply.jwtSign({
        _id: id,
        roles: ['unregistered'],
        steamID64,
      }, {
        expiresIn: '10min',
      });

      refreshToken = await reply.jwtSign({
        _id: id,
      }, {
        expiresIn: '2d',
      });
    } catch (err) {
      log.error('Error creating token!', err);
    }

    reply.status(201).send({ status: 'CREATED', accessToken, refreshToken });
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login/verify',
  schema,
  handler,
};
