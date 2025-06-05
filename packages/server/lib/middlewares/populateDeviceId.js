const crypto = require('crypto')

//const IS_STRESS_TESTING = process.env.LAMASSU_STRESS_TESTING === 'YES'

function sha256(buf) {
  if (!buf) return null
  const hash = crypto.createHash('sha256')

  hash.update(buf)
  return hash.digest('hex').toString('hex')
}

const populateDeviceId = function (req, res, next) {
  const peerCert = req.socket.getPeerCertificate
    ? req.socket.getPeerCertificate()
    : null
  let deviceId = peerCert?.raw ? sha256(peerCert.raw) : null

  //if (!deviceId && IS_STRESS_TESTING) deviceId = req.headers.device_id

  if (!deviceId)
    return res.status(500).json({ error: 'Unable to find certificate' })
  req.deviceId = deviceId
  req.deviceTime = req.get('date')

  next()
}

module.exports = populateDeviceId
