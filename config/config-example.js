module.exports = {
  host: 'Backend URI. E.g. http://localhost:3000 !Do not use backslash!',
  frontendSteamCallbackUri: 'Steam will redirect users to this url after login in',
  frontendEmailVerificationUri: 'Email verification links will move user here',
  frontendPasswordResetUri: 'Password reset links will move user here',
  allFrontendEmailVerificationUri: '',
  allFrontendPasswordResetUri: '',
  database: {
    mongo: {
      uri: 'E.g mongodb://localhost:27017/akl-backend',
    },
  },
  jwt: {
    secret: 'E.g sshhhhhhhh',
  },
  steam: {
    webApiKey: 'Get steam web api key',
  },
  mailOptions: {
    host: 'smtp server',
    port: 587,
    secure: false,
    auth: {
      user: 'username',
      pass: 'password',
    },
  },
  riot: {
    webApiKey: '',
  },
  superAdminCredentials: {
    username: 'Username',
    password: 'veryLongAndSecurePassword',
    email: 'example@email.com',
  },
  serviceEmail: '"Akateeminen Kynäriliiga" <>',
  challongeBackendServiceUri: 'URL for challonge backend service. E.g. http:localhost:3001',
};
