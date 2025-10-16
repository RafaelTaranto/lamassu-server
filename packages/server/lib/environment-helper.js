const path = require('path')

const isDevMode = () => process.env.NODE_ENV === 'development'
const isProdMode = () => process.env.NODE_ENV === 'production'

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

function isRemoteNode(crypto) {
  return process.env[`${crypto.cryptoCode}_NODE_LOCATION`] === 'remote'
}

function isRemoteWallet(crypto) {
  return process.env[`${crypto.cryptoCode}_WALLET_LOCATION`] === 'remote'
}

const skip2fa = process.env.SKIP_2FA === 'true'

function getCustomTextEntries() {
  const customTextEntries = []

  Object.keys(process.env).forEach(key => {
    if (key.startsWith('CUSTOM_TEXT_')) {
      const id = key
        .replace('CUSTOM_TEXT_', '')
        .toLowerCase()
        .replace(/_/g, '-')
      const text = process.env[key]
      if (text) {
        customTextEntries.push({ id, text })
      }
    }
  })

  return customTextEntries
}

module.exports = {
  isDevMode,
  isProdMode,
  isRemoteNode,
  isRemoteWallet,
  skip2fa,
  getCustomTextEntries,
}
