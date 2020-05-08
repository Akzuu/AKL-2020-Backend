const config = require('config');
const request = require('request-promise-native');
const errorHandler = require('./handle-riot-api-errors');
const { tierMap, rankMap } = require('./riot-ranks');

const RIOTAPIKEY = config.get('riot.webApiKey');

/**
 * Fetch Riot user rank from Riot Games' API
 * @param {String} summonerId users encrypted summonerId
 */
const fetchUserRank = async (summonerId) => {
  const options = {
    uri: `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOTAPIKEY,
    },
    resolveWithFullResponse: true,
    simple: false,
    json: true,
  };

  const { body, statusCode } = await request(options);

  if (statusCode === 200) {
    let newTier = 'UNRANKED';
    let newRank = 'UNRANKED';
    body.forEach(({ tier, rank }) => {
      if (tierMap.get(tier) >= tierMap.get(newTier)) {
        newTier = tier;
        if (rankMap.get(rank) > rankMap.get(newRank)) {
          newRank = rank;
        }
      }
    });

    // Check the highest rank of the user
    let totalRank;
    if (newTier === 'UNRANKED') {
      totalRank = 'UNRANKED';
    } else {
      totalRank = `${newTier} ${newRank}`;
    }
    return totalRank;
  }

  const error = await errorHandler(statusCode, body.status.message);
  throw error;
};

module.exports = fetchUserRank;
