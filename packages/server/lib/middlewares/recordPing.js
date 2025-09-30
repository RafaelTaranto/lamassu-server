const { enqueueRecordPing } = require('../machine-loader')

const record = (req, res, next) => {
  enqueueRecordPing({
    deviceId: req.deviceId,
    last_online: req.deviceTime,
    model: req.query.model,
    version: req.query.version,
    restrictionLevel: req.query.restrictionLevel || 0,
  })
  next()
}

module.exports = record
