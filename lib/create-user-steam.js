const config = require('config');
const request = require('request-promise-native');
const SteamId = require('steamid');
const { User } = require('../models');
const { log } = require('./index');

const STEAMWEBAPIKEY = config.get('steam.webApiKey');

/**
 * Fetch steam user data from the steam web api.
 * @param {String} steamID64 Users steam id in 64-format
 */
const fetchUserData = async (steamID64) => {
  const options = {
    uri: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
    qs: {
      key: STEAMWEBAPIKEY,
      steamids: steamID64,
    },
    json: true,
  };

  const { response } = await request(options);

  if (!response || !response.players[0]) {
    throw new Error(`User not found with the following steamID64: ${steamID64}`);
  }

  return response.players[0];
};

/**
 * Create user to database. It will not be complete and must be completed
 * before user can access site.
 * @param {String} steamID64 Users steam id in 64-format
 */
const createUser = async (steamID64) => {
  let steamUser;
  try {
    steamUser = await fetchUserData(steamID64);
  } catch (error) {
    log.error('Error when trying to fetch steam user data! ', error);
    return {
      status: 'ERROR',
      error: 'Error when trying to fetch steam user data!',
    };
  }

  const sid = new SteamId(steamID64);

  const payload = {
    steam: {
      userName: steamUser.personaname,
      steamID: sid.getSteam2RenderedID(false),
      steamID64,
      avatar: steamUser.avatarfull,
      profileUrl: steamUser.profileurl,
    },
  };

  let user;
  try {
    user = await User.create(payload);
  } catch (error) {
    log.error('Error when trying to create user from steam data! ', error);
    return {
      status: 'ERROR',
      error: 'Error when trying to create user from steam data!',
    };
  }

  return {
    status: 'OK',
    payload: {
      _id: user._id,
    },
  };
};

module.exports = createUser;
