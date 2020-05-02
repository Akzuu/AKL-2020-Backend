const config = require('config');
const nodemailer = require('nodemailer');

const MAIL_OPTIONS = config.get('mailOptions');
const FROM = config.get('serviceEmail');

const transporter = nodemailer.createTransport(MAIL_OPTIONS);

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
  console.log('Mail sent');
};

module.exports = sendMail;
