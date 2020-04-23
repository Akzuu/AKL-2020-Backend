const createSeason = require('./create-season');
const deleteSeason = require('./delete-season');
const getAllSeasons = require('./get-all-seasons');
const getSeason = require('./get-season');
const updateSeason = require('./update-season');
const applyToSeason = require('./apply-to-season');
const handleApplication = require('./handle-application');
const removeTeamFromSeason = require('./remove-team-from-season');

module.exports = {
  createSeason,
  deleteSeason,
  getAllSeasons,
  getSeason,
  updateSeason,
  applyToSeason,
  handleApplication,
  removeTeamFromSeason,
};
