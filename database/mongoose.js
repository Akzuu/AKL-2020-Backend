const mongoose = require('mongoose');
const config = require('config');
const { log } = require('../lib');

const MONGO_URI = config.get('database.mongo.uri');
const MONGO_OPTIONS = config.get('datbase.mongo.options');

const startDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
  } catch (error) {
    log.error('Error connecting mongodb!', error);
  }
};

module.exports = { startDatabase };
