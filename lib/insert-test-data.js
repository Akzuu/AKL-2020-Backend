const { testUserDataArray, testSeasonDataArray } = require('../testdata/testdata');
const { User, Season } = require('../models');

const insertTestData = async () => {
  await Season.insertMany(testSeasonDataArray);
  await User.create(testUserDataArray);
};

module.exports = insertTestData;
