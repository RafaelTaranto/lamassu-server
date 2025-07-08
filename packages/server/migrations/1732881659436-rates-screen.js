const _ = require('lodash/fp')
const { loadConfig, saveConfig } = require('./settings')

exports.up = function (next) {
  const newConfig = {}
  return loadConfig()
    .then(config => {
      if (!_.isNil(config.machineScreens_rates_active)) return
      newConfig[`machineScreens_rates_active`] = true
      return saveConfig(newConfig)
    })
    .then(next)
    .catch(err => {
      return next(err)
    })
}

module.exports.down = function (next) {
  next()
}
