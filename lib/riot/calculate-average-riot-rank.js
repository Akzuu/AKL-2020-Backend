const { User } = require('../../models');
const { intToRank, rankToInt } = require('./riot-ranks');

/**
 * Calculates average Riot rank of users in given array
 * Errors will be passed to calling function
 * @param {Array[objectId]} userIds
 */
const calculateAverageRiotRank = async (userIds) => {
  let users = [];
  users = await User.find({
    _id: { $in: userIds },
    riotGames: { $exists: true },
  });

  let averageRank = 'UNRANKED';
  let sum = 0;
  let divider = 0;
  users.forEach((user) => {
    if (user.riotGames.rank !== 'UNRANKED') {
      sum += rankToInt.get(user.riotGames.rank);
      divider += 1;
    }
  });
  if (divider) {
    averageRank = intToRank.get(sum / divider);
  }

  return averageRank;
};

module.exports = calculateAverageRiotRank;
