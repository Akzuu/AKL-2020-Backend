const config = require('config');

const fastify = require('fastify');
const fastifySwagger = require('fastify-swagger');
const fastifyJWT = require('fastify-jwt');
const routes = require('./routes');

const APPLICATION_PORT = config.get('port');
const JWT_SECRET = config.get('jwt.secret');


// Initialize swagger
const initSwagger = () => {
  const swaggerOptions = config.get('swagger');

  return {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Project AKL 2020 Web Backend - Core',
        description: 'Project AKL 2020 Web Backend - Core',
        version: '1.0.0',
      },
      host: swaggerOptions.host,
      schemes: swaggerOptions.schemes,
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'Integration',
          description: 'Integration endpoints for accessing and controlling data',
        },
        {
          name: 'Utility',
          description: 'Utility endpoints',
        },
      ],
    },
    exposeRoute: true,
  };
};


// Routes
const userRoute = async (server) => {
  Object.keys(routes.integration).forEach((key) => {
    server.route(routes.integration[key]);
  });
};

const teamRoute = async (server) => {
  Object.keys(routes.team).forEach((key) => {
    server.route(routes.team[key]);
  });
};


const seasonRoute = async (server) => {
  Object.keys(routes.season).forEach((key) => {
    server.route(routes.season[key]);
  });
};


const integrationRoute = async (server) => {
  Object.keys(routes.integration).forEach((key) => {
    server.route(routes.integration[key]);
  });
};


const utilityRoute = async (server) => {
  Object.keys(routes.utility).forEach((key) => {
    server.route(routes.utility[key]);
  });
};

/**
 * Init server
 * @param {Object} options Optional.
 */
const initServer = async (options) => {
  const server = fastify(options);

  server
    .register(fastifySwagger, initSwagger())
    .register(fastifyJWT, { secret: JWT_SECRET })
    .register(userRoute, { prefix: '/user' })
    .register(utilityRoute, { prefix: '/utility' })
    .register(teamRoute, { prefix: '/team' })
    .register(seasonRoute, { prefix: '/season' })
    .register(integrationRoute, { prefix: 'integration' });


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
