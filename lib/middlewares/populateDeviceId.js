const _ = require('lodash/fp')
const crypto = require('crypto')

const logger = require('../logger')

const IS_STRESS_TESTING = process.env.LAMASSU_STRESS_TESTING === "YES"

function sha256 (buf) {
  if (!buf) return null
  const hash = crypto.createHash('sha256')

  hash.update(buf)
  return hash.digest('hex').toString('hex')
}

const populateDeviceId = function (req, res, next) {
  let deviceId = _.isFunction(req.connection.getPeerCertificate)
    ? sha256(req.connection.getPeerCertificate()?.raw)
    : null

  if (!deviceId && IS_STRESS_TESTING)
    deviceId = req.headers.device_id

  if (!deviceId) return res.status(500).json({ error: 'Unable to find certificate' })
  req.deviceId = deviceId
  req.deviceTime = req.get('date')

  next()
}

module.exports = populateDeviceId
