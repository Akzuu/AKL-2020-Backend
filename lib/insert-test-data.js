const { testUserDataArray, testSeasonDataArray, testTeamDataArray } = require('../testdata/testdata');
const { User, Season, Team } = require('../models');

const insertTestData = async () => {
  await Season.insertMany(testSeasonDataArray);
  const users = await User.create(testUserDataArray);
  testTeamDataArray[0].captain = users[0]._id;
  users.forEach((user) => {
    testTeamDataArray[0].members.push(user._id);
  });

  await Team.create(testTeamDataArray);
};

module.exports = insertTestData;
