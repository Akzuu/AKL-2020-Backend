const config = require('config');
const request = require('request-promise-native');
const errorHandler = require('./handle-riot-api-errors');
const { rankToInt } = require('./riot-ranks');

const RIOTAPIKEY = config.get('riot.webApiKey');

/**
 * Fetch Riot user from Riot Games' API
 * @param {String} username Riot username
 */
const fetchRiotUser = async (username) => {
  if (!username) {
    const error = new Error('Bad request! ');
    error.statusCode = 400;
    error.status = 'ERROR';
    error.error = 'Bad Request';
    throw error;
  }
  const options = {
    uri: `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`,
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
    return body;
  }

  throw await errorHandler(statusCode, body.status.message);
};


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
    let newRank = 'UNRANKED';

    body.forEach(({ tier, rank }) => {
      let tempRank = `${tier} ${rank}`;
      if (tier === 'UNRANKED') {
        tempRank = tier;
      }
      if (rankToInt.get(tempRank) > rankToInt.get(newRank)) {
        newRank = tempRank;
      }
    });

    return newRank;
  }

  throw await errorHandler(statusCode, body.status.message);
};

module.exports = {
  fetchRiotUser,
  fetchUserRank,
};
