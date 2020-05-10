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

  const promiseArray = [];

  function runUpdate(userToBeSaved, team) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate({
        _id: userToBeSaved._id,
      }, {
        $push: { currentTeams: team._id },
      })
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  teams.forEach((team) => {
    team.members.forEach((member) => {
      promiseArray.push(runUpdate(
        users.find(user => user._id === member),
        team,
      ));
    });
  });

  Promise.all(promiseArray);
};

module.exports = insertTestData;
