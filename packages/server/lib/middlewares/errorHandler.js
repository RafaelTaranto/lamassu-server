const logger = require('../logger')

function errorHandler(err, req, res) {
  const statusCode = err.name === 'HTTPError' ? err.code || 500 : 500

  const json = { error: err.message }

  if (statusCode >= 400) logger.error(err)

  return res.status(statusCode).json(json)
}

module.exports = errorHandler
