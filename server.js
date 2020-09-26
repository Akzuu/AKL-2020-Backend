const config = require('config');

const fastify = require('fastify');
const fastifySwagger = require('fastify-swagger');
const fastifyJWT = require('fastify-jwt');
const fastifyHelmet = require('fastify-helmet');
const fastifyAuth = require('fastify-auth');
const fastifyCors = require('fastify-cors');
const routes = require('./routes');

const { auth } = require('./lib');

const APPLICATION_PORT = config.get('port');
const JWT_SECRET = config.get('jwt.secret');
const ROUTE_PREFIX = config.get('routePrefix');
const FASTIFY_OPTIONS = config.get('fastifyOptions');


// Initialize swagger
const initSwagger = () => {
  const swaggerOptions = config.get('swagger');

  return {
    routePrefix: `${ROUTE_PREFIX}/documentation`,
    swagger: {
      info: {
        title: 'Project AKL 2020 Web Backend - Core',
        description: 'Project AKL 2020 Web Backend - Core',
        version: '1.0.0',
      },
      host: swaggerOptions.host,
      schemes: swaggerOptions.schemes,
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
      security: [{
        bearerAuth: [],
      }],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'Integration',
          description: '...',
        }, {
          name: 'Utility',
          description: 'Utility endpoints',
        }, {
          name: 'User',
          description: 'CRUD endpoints related to Users',
        }, {
          name: 'Team',
          description: 'CRUD endpoints related to Teams',
        }, {
          name: 'Season',
          description: 'CRUD endpoints related to Seasons',
        }, {
          name: 'Devtest',
          description: 'These endpoints should only be used for testing. DO NOT USE IN REAL APPLICATION!',
        }, {
          name: 'Text',
          description: 'Endpoints for managing text resources on the site',
        },
      ],
    },
    exposeRoute: true,
  };
};

/**
 * Routes
 * There is try catch inside the loop, because if we want to authenticate
 * user, we must export route function instead of just options object.
 *
 * See routes/integration/login-email.js vs routes/integration/login-steam.js
 * for more information.
 */
const userRoute = async (server) => {
  Object.keys(routes.user).forEach((key) => {
    try {
      server.route(routes.user[key]);
    } catch (error) {
      routes.user[key](server);
    }
  });
};

const teamRoute = async (server) => {
  Object.keys(routes.team).forEach((key) => {
    try {
      server.route(routes.team[key]);
    } catch (error) {
      routes.team[key](server);
    }
  });
};


const seasonRoute = async (server) => {
  Object.keys(routes.season).forEach((key) => {
    try {
      server.route(routes.season[key]);
    } catch (error) {
      routes.season[key](server);
    }
  });
};


const integrationRoute = async (server) => {
  Object.keys(routes.integration).forEach((key) => {
    try {
      server.route(routes.integration[key]);
    } catch (error) {
      routes.integration[key](server);
    }
  });
};


const utilityRoute = async (server) => {
  Object.keys(routes.utility).forEach((key) => {
    try {
      server.route(routes.utility[key]);
    } catch (error) {
      routes.utility[key](server);
    }
  });
};

const textRoute = async (server) => {
  Object.keys(routes.text).forEach((key) => {
    try {
      server.route(routes.text[key]);
    } catch (error) {
      routes.text[key](server);
    }
  });
};

const commentRoute = async (server) => {
  Object.keys(routes.comment).forEach((key) => {
    try {
      server.route(routes.comment[key]);
    } catch (error) {
      routes.comment[key](server);
    }
  });
};


/**
 * Init server
 * @param {Object} options Optional.
 */
const initServer = async () => {
  const server = fastify({
    logger: FASTIFY_OPTIONS.logger,
    ignoreTrailingSlash: FASTIFY_OPTIONS.ignoreTrailingSlash,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
      },
    },
  });

  // Register plugins and routes
  server
    .decorate('verifyEmailAndPassword', auth.verifyEmailAndPassword)
    .decorate('verifyJWT', auth.verifyJWT)
    .register(fastifySwagger, initSwagger())
    .register(fastifyJWT, { secret: JWT_SECRET })
    .register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\''],
          imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
          scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
        },
      },
    })
    .register(fastifyAuth)
    .register(fastifyCors, {
      origin: (origin, cb) => {
        cb(null, true);
      },
    })
    .register(userRoute, { prefix: `${ROUTE_PREFIX}/user` })
    .register(utilityRoute, { prefix: `${ROUTE_PREFIX}/utility` })
    .register(teamRoute, { prefix: `${ROUTE_PREFIX}/team` })
    .register(seasonRoute, { prefix: `${ROUTE_PREFIX}/season` })
    .register(integrationRoute, { prefix: `${ROUTE_PREFIX}/integration` })
    .register(textRoute, { prefix: `${ROUTE_PREFIX}/text` })
    .register(commentRoute, { prefix: `${ROUTE_PREFIX}/comment` });


  return {
    start: async () => {
      await server.listen(APPLICATION_PORT, '0.0.0.0');
      return server;
    },
  };
};

module.exports = {
  initServer,
};
