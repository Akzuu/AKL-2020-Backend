const { Team } = require('../../models');
const calculateAverageRiotRank = require('./calculate-average-riot-rank');
const log = require('../logger');

/**
 * Check if user is in LoL team and updats its rank
 * @param {Object} user
 */
const updateTeamRank = async (user) => {
  if (user.currentTeams.length > 0) {
    let currentTeams;
    try {
      currentTeams = await Team.find({
        _id: { $in: user.currentTeams },
      });
    } catch (error) {
      log.error('Error finding users teams! ', error);
      const err = new Error();
      err.statusCode = 500;
      throw err;
    }

    const [riotTeam] = currentTeams.filter(team => team.game === 'League of Legends');
    let newRank;
    try {
      newRank = await calculateAverageRiotRank(riotTeam.members);
    } catch (error) {
      log.error('Error trying to calculate average rank! ', error);
      const err = new Error();
      err.statusCode = 500;
      throw err;
    }

    try {
      await Team.updateOne({
        _id: riotTeam._id,
      }, {
        rank: newRank,
      });
    } catch (error) {
      log.error('Error when trying to update teams rank! ', error);
      const err = new Error();
      err.statusCode = 500;
      throw err;
    }
  }
};

module.exports = updateTeamRank;
