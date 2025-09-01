const crypto = require('crypto')

const _ = require('lodash/fp')
const {
  db: { default: db, inTransaction },
  notify: { notifyReload },
  userConfig,
} = require('typesafe-db')

const {
  getTermsConditions,
  setTermsConditions,
} = require('./new-config-manager')

const PASSWORD_FILLED = 'PASSWORD_FILLED'
const SECRET_FIELDS = [
  'bitgo.BTCWalletPassphrase',
  'bitgo.LTCWalletPassphrase',
  'bitgo.ZECWalletPassphrase',
  'bitgo.BCHWalletPassphrase',
  'bitgo.DASHWalletPassphrase',
  'bitstamp.secret',
  'itbit.clientSecret',
  'kraken.privateKey',
  'binanceus.privateKey',
  'cex.privateKey',
  'binance.privateKey',
  'twilio.authToken',
  'telnyx.apiKey',
  'vonage.apiSecret',
  'inforu.apiKey',
  'galoy.walletId',
  'galoy.apiSecret',
  'bitfinex.secret',
  'sumsub.apiToken',
  'sumsub.privateKey',
]

/*
 * JSON.stringify isn't necessarily deterministic so this function may compute
 * different hashes for the same object.
 */
const md5hash = text => crypto.createHash('MD5').update(text).digest('hex')

const addTermsHash = configs => {
  const terms = _.omit(['hash'], getTermsConditions(configs))
  return !terms?.text
    ? configs
    : _.flow(
        _.get('text'),
        md5hash,
        hash => _.set('hash', hash, terms),
        setTermsConditions,
        _.assign(configs),
      )(terms)
}

function saveAccounts(accounts) {
  if (!accounts) {
    return Promise.resolve()
  }

  const mergeAccounts = currentAccounts => {
    const newAccounts = _.merge(currentAccounts, accounts)

    // Only allow one wallet scoring active at a time
    if (accounts.elliptic?.enabled && newAccounts.scorechain) {
      newAccounts.scorechain.enabled = false
    }

    if (accounts.scorechain?.enabled && newAccounts.elliptic) {
      newAccounts.elliptic.enabled = false
    }

    return newAccounts
  }

  return userConfig.saveAccounts(db, mergeAccounts).catch(console.error)
}

function hideSecretFields(accounts) {
  return _.flow(
    _.filter(path => !_.isEmpty(_.get(path, accounts))),
    _.reduce(
      (accounts, path) => _.assoc(path, PASSWORD_FILLED, accounts),
      accounts,
    ),
  )(SECRET_FIELDS)
}

const showAccounts = () => userConfig.loadAccounts(db).then(hideSecretFields)

const saveConfig = config =>
  inTransaction(async tx => {
    const currentConfig = await userConfig.loadConfig(tx)
    const newConfig = addTermsHash(_.assign(currentConfig, config))
    await userConfig.insertConfigRow(tx, { config: newConfig })
    await notifyReload(tx)
  }, db).catch(console.error)

const loadConfig = () => userConfig.loadConfig(db)

const load = version => userConfig.load(db, version)

module.exports = {
  saveConfig,
  saveAccounts,
  showAccounts,
  loadConfig,
  load,
}
