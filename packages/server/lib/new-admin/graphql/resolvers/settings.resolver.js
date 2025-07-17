const settingsLoader = require('../../../new-settings-loader')

const resolvers = {
  Query: {
    accounts: () => settingsLoader.showAccounts(),
    config: () => settingsLoader.loadConfig(),
  },
  Mutation: {
    saveAccounts: (...[, { accounts }]) =>
      settingsLoader.saveAccounts(accounts),
    saveConfigWithTriggers: (source, { config }) =>
      settingsLoader.saveConfigWithTriggers(config),
  },
}

module.exports = resolvers
