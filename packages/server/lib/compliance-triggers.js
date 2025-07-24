const uuid = require('uuid')
const {
  db: { default: db },
  complianceTriggers,
} = require('typesafe-db')

const maxDaysThreshold = triggers =>
  Math.max(...triggers.map(t => t.thresholdDays))

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

const getComplianceTriggerSets = () =>
  complianceTriggers.getComplianceTriggerSets(db)

const getComplianceTriggerSetById = id =>
  complianceTriggers.getComplianceTriggerSetById(db, id)

const getComplianceTriggers = complianceTriggerSetId =>
  complianceTriggers.getComplianceTriggers(db, complianceTriggerSetId)

const createComplianceTriggerSet = name =>
  complianceTriggers.createComplianceTriggerSet(db, uuid.v4(), name)

const deleteComplianceTriggerSet = id =>
  complianceTriggers.deleteComplianceTriggerSet(db, id)

const createComplianceTrigger = (complianceTriggerSetId, trigger) =>
  complianceTriggers.createComplianceTrigger(
    db,
    complianceTriggerSetId,
    trigger,
  )

const deleteComplianceTrigger = id =>
  complianceTriggers.deleteComplianceTrigger(db, id)

const deleteComplianceTriggersByCustomInfoRequestId = customInfoRequestId =>
  complianceTriggers.deleteComplianceTriggersByCustomInfoRequestId(
    db,
    customInfoRequestId,
  )

module.exports = {
  getAllComplianceTriggers: complianceTriggers.getAllComplianceTriggers,
  hasSanctions,
  maxDaysThreshold,
  getCashLimit,
  hasPhone,
  hasFacephoto,
  hasIdScan,
  AUTH_METHODS,

  getComplianceTriggerSets,
  getComplianceTriggerSetById,
  getComplianceTriggers,
  createComplianceTriggerSet,
  deleteComplianceTriggerSet,
  createComplianceTrigger,
  deleteComplianceTrigger,
  deleteComplianceTriggersByCustomInfoRequestId,
}
