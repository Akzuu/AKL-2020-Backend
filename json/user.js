module.exports = {
  type: 'object',
  required: ['userName', 'email', 'passwordHash', 'generalInfo', 'steam'],
  properties: {
    userName: {
      type: 'string',
      min: 1,
    },
    generalInfo: {
      type: 'object',
      required: ['university'],
      properties: {
        firstName: {
          type: 'string',
        },
        surname: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
        guild: {
          type: 'string',
        },
        university: {
          type: 'string',
        },
      },
    },
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      min: 8,
    },
    currentTeam: {
      type: 'string',
    },
    previousTeams: {
      type: ['null', 'array'],
      items: {
        type: 'string',
      },
    },
    steam: {
      type: 'object',
      required: ['steamID', 'steamID64'],
      properties: {
        steamID: {
          type: 'string',
        },
        steamID64: {
          type: 'string',
        },
      },
    },
  },
};
