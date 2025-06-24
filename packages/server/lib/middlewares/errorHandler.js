const logger = require('../logger')

function errorHandler(err, req, res, next) {
  const statusCode = err.name === 'HTTPError' ? err.code || 500 : 500

  const json = { error: err.message }

  if (statusCode >= 400) logger.error(err)

  res.status(statusCode).json(json)
  next(err)
}

module.exports = errorHandler
