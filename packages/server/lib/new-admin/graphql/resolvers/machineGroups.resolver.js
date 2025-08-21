const DataLoader = require('dataloader')

const {
  getAllMachineGroups,
  createMachineGroup,
  deleteMachineGroup,
  assignComplianceTriggerSetToMachineGroup,
} = require('../../services/machineGroups')

const {
  getComplianceTriggerSetsByIdsBatch,
} = require('../../services/triggers')

const complianceTriggerSetsLoader = new DataLoader(
  ids => getComplianceTriggerSetsByIdsBatch(ids),
  { cache: false },
)

const resolvers = {
  MachineGroup: {
    complianceTriggerSet: parent =>
      parent.complianceTriggerSetId
        ? complianceTriggerSetsLoader.load(parent.complianceTriggerSetId)
        : null,
  },
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
