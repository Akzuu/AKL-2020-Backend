module.exports = {
  type: 'object',
  required: ['teamName', 'introductionText', 'application', 'captain', 'active'],
  properties: {
    teamName: {
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
    members: {
      type: ['null', 'array'],
      items: {
        type: 'string',
      },
    },
    seasons: {
      type: ['null', 'array'],
      items: {
        type: 'string',
      },
    },
    active: {
      type: 'boolean',
    },
    rank: {
      type: 'string',
    },
  },
};
