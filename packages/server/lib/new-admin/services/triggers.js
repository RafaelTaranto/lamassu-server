const { PG_ERROR_CODES } = require('typesafe-db')

const complianceTriggers = require('../../compliance-triggers')
const { ResourceAlreadyExistsError } = require('../graphql/errors')

const getComplianceTriggerSets = () =>
  complianceTriggers.getComplianceTriggerSets()

const getComplianceTriggerSetById = id =>
  complianceTriggers.getComplianceTriggerSetById(id)

const getComplianceTriggers = complianceTriggerSetId =>
  complianceTriggers.getComplianceTriggers(complianceTriggerSetId)

const createComplianceTriggerSet = name =>
  complianceTriggers.createComplianceTriggerSet(name).catch(error => {
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION)
      throw new ResourceAlreadyExistsError({ name })
    throw error
  })

const deleteComplianceTriggerSet = id =>
  complianceTriggers.deleteComplianceTriggerSet(id)

const createComplianceTrigger = (complianceTriggerSetId, trigger) =>
  complianceTriggers.createComplianceTrigger(complianceTriggerSetId, trigger)

const deleteComplianceTrigger = id =>
  complianceTriggers.deleteComplianceTrigger(id)

module.exports = {
  getComplianceTriggerSets,
  getComplianceTriggerSetById,
  getComplianceTriggers,
  createComplianceTriggerSet,
  deleteComplianceTriggerSet,
  createComplianceTrigger,
  deleteComplianceTrigger,
}
