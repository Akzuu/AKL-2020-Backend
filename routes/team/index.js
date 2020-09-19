const createTeam = require('./create-team');
const deleteTeam = require('./delete-team');
const getAllTeams = require('./get-all-teams');
const updateTeam = require('./update-team');
const getTeam = require('./get-team');
const applyToTeam = require('./apply-to-team');
const handleApplication = require('./handle-application');
const leaveTeam = require('./leave-team');
const removeTeamMember = require('./remove-team-member');
const getCaptainIds = require('./get-captain-ids');

module.exports = {
  createTeam,
  deleteTeam,
  getAllTeams,
  updateTeam,
  getTeam,
  applyToTeam,
  handleApplication,
  leaveTeam,
  removeTeamMember,
  getCaptainIds,
};
