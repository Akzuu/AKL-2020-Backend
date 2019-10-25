module.exports = {
  type: 'object',
  required: ['teamName', 'introductionText', 'application', 'captain', 'active'],
  properties: {
    teamName: {
      type: 'string',
      minLength: 3,
    },
    abbreviation: {
      type: 'string',
      minLength: 1,
    },
    introductionText: {
      type: 'string',
    },
    application: {
      type: 'string',
      format: 'email',
    },
    captain: {
      type: 'string',
      minLength: 3,
    },
    active: {
      type: 'boolean',
    },
    rank: {
      type: 'string',
      enum: [
        'Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master',
        'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master',
        'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite',
        'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master',
        'Supreme Master First Class', 'Global Elite'],
    },
  },
};
