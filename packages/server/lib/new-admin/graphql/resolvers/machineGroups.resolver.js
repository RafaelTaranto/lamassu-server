const {
  getAllMachineGroups,
  createMachineGroup,
  deleteMachineGroup,
  assignComplianceTriggerSetToMachineGroup,
} = require('../../services/machineGroups')

const resolvers = {
  Query: {
    machineGroups: () => getAllMachineGroups(),
  },
  Mutation: {
    createMachineGroup: (...[, { name }]) => createMachineGroup(name),
    deleteMachineGroup: (...[, { id }]) => deleteMachineGroup(id),
    assignComplianceTriggerSetToMachineGroup: (
      source,
      { id, complianceTriggerSetId },
    ) => assignComplianceTriggerSetToMachineGroup(id, complianceTriggerSetId),
  },
}

module.exports = resolvers
