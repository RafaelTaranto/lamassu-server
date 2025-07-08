const _ = require('lodash/fp')
const { loadConfig, saveConfig } = require('./settings')

exports.up = function (next) {
  return loadConfig()
    .then(config => {
      if (!_.isNil(config.locale_timezone)) return
      const newConfig = { locale_timezone: 'GMT' }
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
