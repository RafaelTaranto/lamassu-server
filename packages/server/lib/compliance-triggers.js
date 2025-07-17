const _ = require('lodash/fp')

const { complianceTriggers } = require('typesafe-db')

function maxDaysThreshold(triggers) {
  return _.max(_.map('thresholdDays')(triggers))
}

const getCashLimit = triggers =>
  Math.min(
    ...triggers.flatMap(({ triggerType, requirementType, threshold }) => {
      const withFiat = ['txVolume', 'txAmount'].includes(triggerType)
      const blocking = ['block', 'suspend'].includes(requirementType)
      return withFiat && blocking && threshold ? [threshold] : []
    }),
  ) || Infinity

const hasRequirement = requirementType => triggers =>
  triggers.some(t => t.requirementType === requirementType)

const hasPhone = hasRequirement('sms')
const hasFacephoto = hasRequirement('facephoto')
const hasIdScan = hasRequirement('idCardData')
const hasSanctions = hasRequirement('sanctions')

const AUTH_METHODS = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
}

module.exports = {
  getAllComplianceTriggers: complianceTriggers.getAllComplianceTriggers,
  saveAllComplianceTriggers: complianceTriggers.saveAllComplianceTriggers,
  hasSanctions,
  maxDaysThreshold,
  getCashLimit,
  hasPhone,
  hasFacephoto,
  hasIdScan,
  AUTH_METHODS,
}
