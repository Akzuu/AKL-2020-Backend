module.exports = {
  host: 'Backend URI. E.g. http://localhost:3000 !Do not use backslash!',
  loginRedirectUri: `Frontend uri. Steam logins will be redirected to this uri. 
                    Will have query params status, accessToken and refreshToken.
                    If error, will have query params status and error`,
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
  superAdminCredentials: {
    username: 'Username',
    password: 'veryLongAndSecurePassword',
  },
  serviceEmail: '"Akateeminen Kynäriliiga" <akl@null.net>',
};
