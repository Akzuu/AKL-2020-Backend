const config = require('config');
const mongodb = require('./database/mongo');
const { initServer } = require('./server');
const { log, createSuperAdmin, insertTestData } = require('./lib');


module.exports = (async () => {
  // Initialize database connection
  try {
    await mongodb.start();
  } catch (error) {
    log.error('Error starting database!', error);
    process.exit(1);
  }


  // Start server
  try {
    const server = await initServer();
    await server.start();
  } catch (error) {
    log.error('Error starting server!', error);
    process.exit(1);
  }

  try {
    await createSuperAdmin();
  } catch (error) {
    log.error('Error creating superadmin! ', error);
  }

  if (config.get('createTestData')) {
    try {
      await insertTestData();
    } catch (error) {
      log.error('Error inserting test data! Might happen because test data already exists. ');
    }
  }

  log.info('Service started successfully!');
})();
