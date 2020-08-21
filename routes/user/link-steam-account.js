const openid = require('openid');
const config = require('config');
const { log } = require('../../lib');
const { User } = require('../../models');

const HOST = config.get('host');
const ROUTE_PREFIX = config.get('routePrefix');


const schema = {
  description: 'Links Steam account to already existing user account',
  summary: 'Link Steam account',
  tags: ['User'],
  response: {
  },
};


/**
 * Links steam account to already existing user account
 * @param {*} req
 * @param {*} reply
 */
const handler = async (req, reply) => {
  let user;
  try {
    user = await User.findOne({
      _id: req.auth.jwtPayload._id,
    });
  } catch (error) {
    log.error('Error when trying to find user! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  if (!user || (user.steam && user.steam.steamID64)) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
      message: 'User account already linked to a steam account!',
    });
    return;
  }

  let linkToken;
  try {
    linkToken = await reply.jwtSign({
      _id: req.auth.jwtPayload._id,
    }, {
      expiresIn: '24h',
    });
  } catch (error) {
    log.error('Error trying to create confirmation token! ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  const relyingParty = new openid.RelyingParty(
    `${HOST}${ROUTE_PREFIX}/integration/steam/login/verify?linkToken=${linkToken}`, // Callback url
    null, // Realm (optional, specifies realm for OpenID authentication)
    true, // Use stateless verification, must be true with Steam
    false, // Strict mode
    [], // List of extensions to enable and include
  );

  relyingParty.authenticate('https://steamcommunity.com/openid', false, (error, authUrl) => {
    if (error) {
      log.error(`Authentication failed: ${error.message}`);
      reply.send(`Authentication failed: ${error.message}`);
    } else if (!authUrl) {
      reply.send('Authentication failed');
    } else {
      reply.send({
        url: authUrl,
        backendCallbackUrl: `${HOST}${ROUTE_PREFIX}/integration/steam/login/verify?linkToken=${linkToken}`,
      });
    }
  });
};


module.exports = async function (fastify) {
  fastify.route({
    method: 'GET',
    url: '/link/steam',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
