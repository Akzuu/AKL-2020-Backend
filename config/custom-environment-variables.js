module.exports = {
  host: 'HOST',
  frontendSteamCallbackUri: 'FRONTEND_STEAM_CALLBACK_URI',
  frontendEmailVerificationUri: 'FRONTEND_EMAIL_VERIFICATION_CALLBACK_URI',
  frontendPasswordResetUri: 'FRONTEND_PASSWORD_RESET_URI',
  database: {
    mongo: {
      uri: 'MONGODB_URI',
    },
  },
  jwt: {
    secret: 'JWT_SECRET',
  },
  steam: {
    webApiKey: 'STEAM_WEB_API_KEY',
  },
  mailOptions: {
    host: 'SMTP_SERVER_HOST',
    port: 'SMTP_SERVER_PORT',
    secure: 'SMTP_SECURE',
    auth: {
      user: 'MAIL_USER',
      pass: 'MAIL_PASSWORD',
    },
  },
  riot: {
    webApiKey: 'RIOT_WEB_API_KEY',
  },
  superAdminCredentials: {
    username: 'SUPER_ADMIN_USERNAME',
    password: 'SUPER_ADMIN_PASSWORD',
    email: 'SUPER_ADMIN_EMAIL',
  },
};
