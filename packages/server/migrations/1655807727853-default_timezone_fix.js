const { loadConfig, saveConfig } = require('./settings')

exports.up = function (next) {
  return loadConfig()
    .then(config => {
      if (config.locale_timezone === '0:0') {
        const newConfig = { locale_timezone: 'GMT' }
        return saveConfig(newConfig)
      }
    })
    .then(next)
    .catch(err => {
      return next(err)
    })
}

module.exports.down = function (next) {
  next()
}
