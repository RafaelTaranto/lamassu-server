const { saveConfig } = require('../lib/new-settings-loader')

exports.up = function (next) {
  const newConfig = {
    wallets_advanced_enableLastUsedAddress: false,
  }
  return saveConfig(newConfig)
    .then(next)
    .catch(err => {
      return next(err)
    })
}

module.exports.down = function (next) {
  next()
}
