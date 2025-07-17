const _ = require('lodash/fp')

const { complianceTriggers } = require('typesafe-db')

function maxDaysThreshold(triggers) {
  return _.max(_.map('thresholdDays')(triggers))
}

function getCashLimit(triggers) {
  const withFiat = _.filter(({ triggerType }) =>
    _.includes(triggerType, ['txVolume', 'txAmount']),
  )
  const blocking = _.filter(({ requirementType }) =>
    _.includes(requirementType, ['block', 'suspend']),
  )
  return _.compose(_.minBy('threshold'), blocking, withFiat)(triggers)
}

const hasRequirement = requirementType =>
  _.compose(_.negate(_.isEmpty), _.find(_.matches({ requirementType })))

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
