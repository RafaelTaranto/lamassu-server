const {
  getComplianceTriggerSets,
  getComplianceTriggerSetById,
  getComplianceTriggers,
  createComplianceTriggerSet,
  deleteComplianceTriggerSet,
  createComplianceTrigger,
  deleteComplianceTrigger,
} = require('../../services/triggers')

const Query = {
  complianceTriggerSets() {
    return getComplianceTriggerSets()
  },

  complianceTriggerSetById(source, { id }) {
    return getComplianceTriggerSetById(id)
  },

  complianceTriggers(source, { complianceTriggerSetId }) {
    return getComplianceTriggers(complianceTriggerSetId)
  },
}

const Mutation = {
  createComplianceTriggerSet(source, { name }) {
    return createComplianceTriggerSet(name)
  },

  deleteComplianceTriggerSet(source, { id }) {
    return deleteComplianceTriggerSet(id)
  },

  createComplianceTrigger(source, { complianceTriggerSetId, trigger }) {
    return createComplianceTrigger(complianceTriggerSetId, trigger).then(
      () => true,
    )
  },

  deleteComplianceTrigger(source, { id }) {
    return deleteComplianceTrigger(id).then(() => true)
  },
}

module.exports = {
  Query,
  Mutation,
}
