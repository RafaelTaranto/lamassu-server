const _ = require('lodash/fp')

const { loadConfig, saveConfig } = require('./settings')

exports.up = function (next) {
  return loadConfig()
    .then(config => {
      if (
        !_.isNil(config.wallets_ETH_zeroConfLimit) &&
        config.wallets_ETH_zeroConfLimit !== 0
      ) {
        const newConfig = { wallets_ETH_zeroConfLimit: 0 }
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
