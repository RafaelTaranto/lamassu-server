const _ = require('lodash/fp')
const { loadConfig, saveConfig } = require('./settings')
const configManager = require('../lib/new-config-manager')

exports.up = async function () {
  const config = await loadConfig()
  const cryptoCodes = configManager.getCryptosFromWalletNamespace(config)
  _.forEach(cryptoCode => {
    const key = `wallets_${cryptoCode}_zeroConf`
    const zeroConfSetting = _.get(key, config)
    if (cryptoCode === 'BTC' && zeroConfSetting === 'blockcypher') return
    if (!_.isNil(zeroConfSetting) && zeroConfSetting !== 'none') {
      config[key] = 'none'
    }
  }, cryptoCodes)
  return saveConfig(config)
}

exports.down = function (next) {
  next()
}
