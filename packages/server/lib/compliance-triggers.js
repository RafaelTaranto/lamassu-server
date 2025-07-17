const _ = require('lodash/fp')

const { complianceTriggers } = require('typesafe-db')

function hasSanctions(triggers) {
  return _.some(_.matches({ requirementType: 'sanctions' }))(triggers)
}

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

const AUTH_METHODS = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
}

module.exports = {
  getAllComplianceTriggers: complianceTriggers.getAllComplianceTriggers,
  saveComplianceTriggers: complianceTriggers.saveComplianceTriggers,
  hasSanctions,
  maxDaysThreshold,
  getCashLimit,
  hasPhone,
  hasFacephoto,
  hasIdScan,
  AUTH_METHODS,
}
