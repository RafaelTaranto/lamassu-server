import type { DBOrTx } from './db.js'
import db, { inTransaction } from './db.js'
import { notifyUpdatedComplianceTriggerSets } from './notify.js'

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

export function setComplianceTriggerSetId(
  id: string,
  complianceTriggerSetId: string | null,
) {
  return inTransaction(async tx => {
    const machineGroup = await tx
      .updateTable('machineGroups')
      .set({ complianceTriggerSetId })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
    await notifyUpdatedComplianceTriggerSets(tx)
    return machineGroup
  }, db)
}

export function getMachineGroupsComplianceTriggerSets(dbOrTx: DBOrTx) {
  return dbOrTx
    .selectFrom('machineGroups')
    .select(['id', 'complianceTriggerSetId'])
    .execute()
}
