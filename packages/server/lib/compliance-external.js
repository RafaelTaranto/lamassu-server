const logger = require('./logger')
const ph = require('./plugin-helper')

const getPlugin = (accounts, pluginCode) => ({
  plugin: ph.load(ph.COMPLIANCE, pluginCode),
  account:
    pluginCode === 'mock-compliance'
      ? { applicantLevel: 'basic' }
      : accounts[pluginCode],
})

const getStatus = (accounts, service, customerId) => {
  try {
    const { plugin, account } = getPlugin(accounts, service)

    return plugin
      .getApplicantStatus(account, customerId)
      .then(status => ({
        service,
        status,
      }))
      .catch(error => {
        if (error.response.status !== 404)
          logger.error(
            `Error getting applicant for service ${service}:`,
            error.message,
          )
        return {
          service,
          status: null,
        }
      })
  } catch (error) {
    logger.error(`Error loading plugin for service ${service}:`, error)
    return Promise.resolve({
      service,
      status: null,
    })
  }
}

const getStatusMap = (accounts, externalComplianceTriggers, customerId) =>
  Promise.all(
    externalComplianceTriggers.map(({ externalService }) =>
      getStatus(accounts, externalService, customerId),
    ),
  ).then(applicantResults =>
    applicantResults.reduce((map, result) => {
      if (result.status) map[result.service] = result.status
      return map
    }, {}),
  )

const createApplicant = (accounts, externalService, customerId) => {
  const { plugin, account } = getPlugin(accounts, externalService)

  return plugin.createApplicant(account, customerId, account.applicantLevel)
}

const createLink = (accounts, externalService, customerId) => {
  const { plugin, account } = getPlugin(accounts, externalService)

  return plugin.createLink(account, customerId, account.applicantLevel)
}

module.exports = {
  getStatusMap,
  createApplicant,
  createLink,
}
