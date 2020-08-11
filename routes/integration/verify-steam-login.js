const openid = require('openid');
const config = require('config');
const SteamId = require('steamid');
const { log, steamUserManager } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');

const schema = {
  description: `This endpoint is used by steam openid when it redirects 
  user from steamcommunity login. It will always have the following query param
  when it redirects to front: status. If status is "OK", it will also have params
  "accessToken", "refreshToken", "linked". If status is "ERROR", it will have
  query param "error", which will indicate the error type. 

  The four possible forward status combos are explained below.
  
  1. Status OK: user has an account or linking steam account was a success.
  User will be forwareded to frontpage with new tokens. The forward uri will have
  a param "linked" which will be true or false. If true, it means that the user
  has successfully linked steam account to their normal account
  2. Status ERROR - Unauthorized: openid login failed. User did not authenticate with steam or smth failed somewhere
  3. Status ERROR - Not Found: User not found with the steamId. User should create user account to service
  4. Status ERROR - Internal Server Error: Something went wrong, error has been logged to backend service`,
  summary: 'Steam openid callback. See description',
  tags: ['Integration'],
};

const relyingParty = new openid.RelyingParty(
  `${HOST}${ROUTE_PREFIX}/integration/steam/login/verify`, // Callback url
  null, // Realm (optional, specifies realm for OpenID authentication)
  true, // Use stateless verification, must be true with Steam
  false, // Strict mode
  [], // List of extensions to enable and include
);

const steamIdRegex = new RegExp(/(\d{17})$/, 'g');


/**
 * This endpoint is used by steam openid when it redirects user from
 * steamcommunity login. So, how does it work?
 *
 * First we verify that the user actually came from steam openid endpoint
 * and we also make sure that the user authenticated there. After that
 * we parse steamid64 from the url and check if the user already has an account
 * on our service. If true, we just redirect user to frontpage with new token.
 *
 * If user does not have an account, he will be redirected to the frontpage
 * TODO: Redirect to register page
 *
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
      [steamID64] = steamIdRegex.exec(result.claimedIdentifier);

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
    let linked = false;
    /**
     * Check if linkToken exists. If it exists, user is linking steam account
     * to their normal account.
     *
     * If it does not exist, check if user exists aka is user logging in.
     */
    if (req.query.linkToken) {
      // Workaround to verify that the linkToken is valid
      req.raw.headers.authorization = `Bearer ${req.query.linkToken}`;
      let authPayload;
      try {
        authPayload = await req.jwtVerify();
      } catch (err) {
        log.error('Error confirming linkToken: ', err);
        reply.status(500).send({
          status: 'ERROR',
          error: 'Internal Server Error',
        });
        return;
      }

      try {
        user = await User.findOne({
          _id: authPayload._id,
        });
      } catch (err) {
        log.error('Error when trying to look for user! ', err);
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

      // Link steam account to the user
      try {
        user = await steamUserManager.linkUser(user, steamID64);
      } catch (err) {
        log.error('Error when trying to link user: ', err);
        reply.status(500).send({
          status: 'ERROR',
          error: 'Internal Server Error',
        });
        return;
      }

      linked = true;
    } else {
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

      reply.send({
        status: 'OK',
        accessToken,
        refreshToken,
        linked,
      });
      return;
    }

    // User not found
    reply.status(404).send({
      status: 'ERROR',
      error: 'Not Found',
    });

    /**
     * This feature has been disabled, because it can create conflicts when
     * user already has an account, but has not yet linked steam account to
     * that account, leading the user having two accounts
     */

    // Start account creation process
    //   let id;
    //   try {
    //     id = await steamUserManager.createUser(steamID64);
    //   } catch (err) {
    //     log.error('Unexpected error while trying to create user! ', err);
    //     reply.redirect(`${REDIRECT_URI}?status=ERROR&error="Internal Server Error"`);
    //     return;
    //   }

    //   let accessToken;
    //   let refreshToken;
    //   try {
    //     accessToken = await reply.jwtSign({
    //       _id: id,
    //       roles: ['unregistered'],
    //       steamID64,
    //     }, {
    //       expiresIn: '10min',
    //     });

    //     refreshToken = await reply.jwtSign({
    //       _id: id,
    //     }, {
    //       expiresIn: '2d',
    //     });
    //   } catch (err) {
    //     log.error('Error creating token!', err);
    //   }

    //   reply.redirect(`${REDIRECT_URI}?status=CREATED
    //              &accessToken=${accessToken}&refreshToken=${refreshToken}`);
  });
};


module.exports = {
  method: 'GET',
  url: '/steam/login/verify',
  schema,
  handler,
};
