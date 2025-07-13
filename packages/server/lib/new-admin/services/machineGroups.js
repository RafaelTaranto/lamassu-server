const { v4: uuid } = require('uuid')
const { machineGroups, PG_ERROR_CODES } = require('typesafe-db')
const { defaultMachineGroup } = require('../../constants')
const {
  ResourceAlreadyExistsError,
  ResourceHasDependenciesError,
} = require('../graphql/errors')

async function getAllMachineGroups() {
  return machineGroups.getMachineGroupsWithDeviceCount()
}

async function createMachineGroup(name) {
  try {
    const newGroup = await machineGroups.createMachineGroup({
      id: uuid(),
      name,
    })

    return {
      ...newGroup,
      deviceCount: 0,
    }
  } catch (error) {
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
      throw new ResourceAlreadyExistsError({ name })
    }
    throw error
  }
}

async function deleteMachineGroup(id) {
  if (id === defaultMachineGroup.uuid) {
    throw new ResourceHasDependenciesError({ id, name: 'default' })
  }

  try {
    return await machineGroups.deleteMachineGroup(id)
  } catch (error) {
    if (error.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
      throw new ResourceHasDependenciesError({ id })
    }
    throw error
  }
}

module.exports = {
  getAllMachineGroups,
  createMachineGroup,
  deleteMachineGroup,
}
