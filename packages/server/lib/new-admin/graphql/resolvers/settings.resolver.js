const settingsLoader = require('../../../new-settings-loader')

const resolvers = {
  Query: {
    accounts: () => settingsLoader.showAccounts(),
    config: () => settingsLoader.loadConfigWithAllTriggers(),
  },
  Mutation: {
    saveAccounts: (...[, { accounts }]) =>
      settingsLoader.saveAccounts(accounts),
    saveConfig: (source, { config }) => settingsLoader.saveConfig(config),
  },
}

module.exports = resolvers
