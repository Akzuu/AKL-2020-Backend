const config = require('config');
const request = require('request-promise-native');
const SteamId = require('steamid');
const { User } = require('../models');

const STEAMWEBAPIKEY = config.get('steam.webApiKey');

/**
 * Fetch steam user data from the steam web api.
 * @param {String} steamId64 Users steam id in 64-format
 */
const fetchUserData = async (steamId64) => {
  const options = {
    uri: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
    qs: {
      key: STEAMWEBAPIKEY,
      steamids: steamId64,
    },
    json: true,
  };

  const { response } = await request(options);

  if (!response || !response.players[0]) {
    throw new Error(`User not found with the following steamId64: ${steamId64}`);
  }

  return response.players[0];
};

/**
 * Create user to database. It will not be complete and must be completed
 * before user can access site.
 * @param {String} steamId64 Users steam id in 64-format
 */
const createUser = async (steamId64) => {
  const steamUser = await fetchUserData(steamId64);

  const sid = new SteamId(steamId64);

  const payload = {
    steam: {
      userName: steamUser.personaname,
      steamId: sid.getSteam2RenderedID(false),
      steamId64,
      avatar: steamUser.avatarfull,
      profileUrl: steamUser.profileurl,
    },
  };


  const user = await User.create(payload);

  return {
    _id: user._id,
    registrationComplete: false,
    steamId64,
  };
};

module.exports = createUser;
