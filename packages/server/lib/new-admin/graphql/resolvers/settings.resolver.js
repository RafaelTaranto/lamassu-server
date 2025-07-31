const settingsLoader = require('../../../new-settings-loader')

const resolvers = {
  Query: {
    accounts: () => settingsLoader.showAccounts(),
    configWithAllTriggers: () => settingsLoader.loadConfigWithAllTriggers(),
    config: () => settingsLoader.loadConfig(),
  },
  Mutation: {
    saveAccounts: (...[, { accounts }]) =>
      settingsLoader.saveAccounts(accounts),
    saveConfig: (source, { config }) => settingsLoader.saveConfig(config),
  },
}

module.exports = resolvers
