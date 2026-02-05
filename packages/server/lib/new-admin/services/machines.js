const machineLoader = require('../../machine-loader')
const { UserInputError } = require('../graphql/errors')

function getMachine(machineId) {
  return machineLoader
    .getMachines()
    .then(machines => machines.find(({ deviceId }) => deviceId === machineId))
}

function machineAction({ deviceId, action, cashUnits, newName }) {
  return getMachine(deviceId)
    .then(machine => {
      if (!machine)
        throw new UserInputError(`machine:${deviceId} not found`, { deviceId })
      return machine
    })
    .then(() =>
      machineLoader.setMachine({ deviceId, action, cashUnits, newName }),
    )
    .then(() => getMachine(deviceId))
}

module.exports = { machineAction }
