const machineSettings = require('../machine-settings')

const getMachineVersion = machineVersion => {
  if (!machineVersion) return null
  machineVersion = parseInt(machineVersion, 10)
  return isNaN(machineVersion) ? null : machineVersion
}

const populateMachineSettings = (req, res, next) => {
  const deviceId = req.deviceId
  const machineVersion = getMachineVersion(req.headers['settings-version'])
  machineSettings
    .getOrUpdate(deviceId, machineVersion)
    .then(settings => {
      if (!settings)
        return next(
          new Error(`No cached settings found for machine ${deviceId}`),
        )
      // TODO: replace all req.settings.config.triggers uses with req.machineSettings.complianceTriggers
      req.settings.config.triggers = settings.complianceTriggers
      req.machineSettings = settings
      next()
    })
    .catch(err => next(err))
}

module.exports = populateMachineSettings
