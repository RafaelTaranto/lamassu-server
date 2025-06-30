const {
  getAllMachineGroups,
  createMachineGroup,
  deleteMachineGroup,
} = require('../../services/machineGroups')

const resolvers = {
  Query: {
    machineGroups: () => getAllMachineGroups(),
  },
  Mutation: {
    createMachineGroup: (...[, { name }]) => createMachineGroup(name),
    deleteMachineGroup: (...[, { id }]) => deleteMachineGroup(id),
  },
}

module.exports = resolvers
