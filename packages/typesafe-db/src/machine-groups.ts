import db from './db.js'

export function createMachineGroup(data: {
  id: string
  name: string
  complianceTriggerSetId: string | null
}) {
  return db
    .insertInto('machineGroups')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function deleteMachineGroup(id: string) {
  return db
    .deleteFrom('machineGroups')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function getMachineGroupsWithDeviceCount() {
  return db
    .selectFrom('machineGroups as mg')
    .leftJoin('devices as d', 'd.machineGroupId', 'mg.id')
    .select([
      'mg.id',
      'mg.name',
      'mg.complianceTriggerSetId',
      eb => eb.fn.count('d.deviceId').as('deviceCount'),
    ])
    .groupBy(['mg.id', 'mg.name'])
    .orderBy(eb =>
      eb.case().when('mg.name', '=', 'default').then(0).else(1).end(),
    )
    .orderBy('mg.name', 'asc')
    .execute()
}
