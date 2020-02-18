module.exports = {
  type: 'object',
  required: ['userName', 'email', 'password', 'university', 'steam'],
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
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    currentTeam: {
      type: 'string',
    },
    registrationComplete: {
      type: 'boolean',
    },
    previousTeams: {
      type: ['null', 'array'],
      items: {
        type: 'string',
      },
    },
    roles: {
      type: ['null', 'array'],
      items: {
        type: 'string',
      },
    },
  },
};
