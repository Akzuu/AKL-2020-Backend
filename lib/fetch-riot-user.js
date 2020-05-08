const config = require('config');
const request = require('request-promise-native');
const errorHandler = require('./handle-riot-api-errors');

const RIOTAPIKEY = config.get('riot.webApiKey');

/**
 * Fetch Riot user from Riot Games' API
 * @param {String} username Riot username
 */
const fetchRiotUser = async (username) => {
  if (!username) {
    const error = new Error('Bad reques! ');
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

module.exports = fetchRiotUser;
