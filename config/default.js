module.exports = {
  port: 3000,
  swagger: {
    host: 'localhost:3000',
    schemes: ['http', 'https'],
  },
  database: {
    mongo: {
      options: {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
    },
  },
  createTestData: true,
  routePrefix: '/aklapi',
  fastifyOptions: {
    logger: false,
    ignoreTrailingSlash: true,
  },
};
