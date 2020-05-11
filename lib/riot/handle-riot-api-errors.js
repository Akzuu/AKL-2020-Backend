const log = require('../logger');

const handleRiotApiErrors = async (statusCode, message) => {
  const error = new Error();
  error.status = 'ERROR';

  if (statusCode === 400) {
    log.error(message);
    error.error = 'Bad Request';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 401) {
    log.error(message);
    error.error = 'Unauthorized';
    error.message = 'Riot api key missing or wrong. Error from Riot Games.';
  }

  if (statusCode === 403) {
    log.error(message);
    error.error = 'Forbidden';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 404) {
    log.error(message);
    error.error = 'Not Found';
    error.message = 'Data not found! Error from Riot Games.';
  }

  if (statusCode === 405) {
    log.error(message);
    error.error = 'Method not allowed! ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 415) {
    log.error(message);
    error.error = 'Unsupported media type! ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 429) {
    log.error(message);
    error.error = 'Rate limit exceeded! ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 500) {
    log.error(message);
    error.error = 'Internal Server Error ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 502) {
    log.error(message);
    error.error = 'Bad gateway! ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 503) {
    log.error(message);
    error.error = 'Service unavailable! ';
    error.message = 'Error from Riot Games.';
  }

  if (statusCode === 504) {
    log.error(message);
    error.error = 'Gateway timeout! ';
    error.message = 'Error from Riot Games.';
  }
  error.statusCode = statusCode;
  return error;
};

module.exports = handleRiotApiErrors;
