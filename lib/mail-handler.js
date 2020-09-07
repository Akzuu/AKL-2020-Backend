const config = require('config');
const nodemailer = require('nodemailer');

const MAIL_OPTIONS = config.get('mailOptions');
const FROM = config.get('serviceEmail');
// const MAIL_AUTH = config.get('mailAuth');

const mailOptions = {
  host: MAIL_OPTIONS.host,
  port: MAIL_OPTIONS.port,
  secure: false,
};

// if (MAIL_AUTH) {
//   mailOptions.authMethod = 'PLAIN';
//   mailOptions.auth = {
//     user: MAIL_OPTIONS.auth.user,
//     pass: MAIL_OPTIONS.auth.pass,
//   };
// }

const transporter = nodemailer.createTransport(mailOptions);

/**
 * Send mail
 * @param {Array} to Array of email addresses
 * @param {String} subject Subject
 * @param {String} text Plaintext
 * @param {String} html HTML mail
 */
const sendMail = async (to, subject, text, html = undefined) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendMail;
