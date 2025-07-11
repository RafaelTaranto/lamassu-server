const { loadConfig, saveConfig } = require('./settings')
const {
  getCryptosFromWalletNamespace,
} = require('../lib/new-config-manager.js')
const { utils: coinUtils } = require('@lamassu/coins')
const _ = require('lodash/fp')

exports.up = function (next) {
  loadConfig()
    .then(config => {
      const newSettings = {}
      const activeCryptos = getCryptosFromWalletNamespace(config)
      if (!activeCryptos.length) return Promise.resolve()
      _.map(crypto => {
        const defaultUnit = _.head(
          _.keys(coinUtils.getCryptoCurrency(crypto).units),
        )
        newSettings[`wallets_${crypto}_cryptoUnits`] = defaultUnit
        return newSettings
      }, activeCryptos)
      return saveConfig(newSettings)
    })
    .then(() => next())
    .catch(err => {
      console.log(err.message)
      return next(err)
    })
}

exports.down = function (next) {
  next()
}
