const { testUserDataArray, testSeasonDataArray, testTeamDataArray } = require('../testdata/testdata');
const { User, Season, Team } = require('../models');

const insertTestData = async () => {
  await Season.insertMany(testSeasonDataArray);

  const users = await User.create(testUserDataArray);

  testTeamDataArray[0].captain = users[0]._id;

  users.forEach((user) => {
    testTeamDataArray[0].members.push(user._id);
  });

  const teams = await Team.create(testTeamDataArray);

  teams.forEach((team) => {
    team.members.forEach((member) => {
      const userToBeSaved = users.find(user => user._id === member);
      User.findOneAndUpdate({
        _id: userToBeSaved._id,
      }, {
        $push: { currentTeams: team._id },
      });
    });
  });
};

module.exports = insertTestData;
