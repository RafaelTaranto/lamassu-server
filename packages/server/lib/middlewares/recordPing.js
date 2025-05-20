const mem = require('mem')

const logger = require('../logger')
const plugins = require('../plugins')
const T = require('../time')

const record = mem(
  ({ deviceId, deviceTime, model, version, settings }) =>
    plugins(settings, deviceId)
      .recordPing(deviceTime, version, model)
      .catch(logger.error),
  {
    cacheKey: ({ deviceId }) => deviceId,
    maxAge: (3 / 2) * T.minute, // lib/notifier/codes.js
  },
)

module.exports = (req, res, next) => {
  record({
    deviceId: req.deviceId,
    deviceTime: req.deviceTime,
    model: req.query.model,
    version: req.query.version,
    settings: req.settings,
  })
  next()
}
