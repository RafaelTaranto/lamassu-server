const _ = require('lodash/fp')
const { loadConfig, saveConfig } = require('./settings')

exports.up = function (next) {
  loadConfig()
    .then(config => {
      if (!_.isEmpty(config)) config.locale_timezone = '0:0'
      return saveConfig(config)
    })
    .then(() => next())
    .catch(err => next(err))
}

exports.down = function (next) {
  next()
}
