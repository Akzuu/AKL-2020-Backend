const { log } = require('./index');
const { Season } = require('../models');

const getCaptainEmails = async (seasonId) => {
  const oneSeason = await Season.findOne({
    _id: seasonId,
  })
    .populate({
      path: 'teams',
      populate: {
        path: 'captain',
        model: 'users',
      },
    });

  const emails = [];

  oneSeason.teams.forEach((team) => {
    emails.push(team.captain.email);
  });

  return emails;
};

module.exports = getCaptainEmails;
