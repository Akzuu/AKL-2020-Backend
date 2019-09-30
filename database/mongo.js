const mongoose = require('mongoose');
const config = require('config');

const MONGO_URI = config.get('database.mongo.uri');
const MONGO_OPTIONS = config.get('database.mongo.options');

const start = async () => {
  await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
};

module.exports = {
  start,
};
