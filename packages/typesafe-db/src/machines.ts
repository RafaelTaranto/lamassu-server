import type { DBOrTx } from './db.js'
import db, { inTransaction } from './db.js'
import { notifyUpdatedMachineGroups } from './notify.js'

export function getMachinesGroups(dbOrTx: DBOrTx) {
  return dbOrTx
    .selectFrom('devices as d')
    .select(['deviceId', 'machineGroupId'])
    .where('paired', '=', true)
    .execute()
}

export function assignMachinesToGroup(deviceIds: [string], groupId: string) {
  return inTransaction(async tx => {
    const machines = await tx
      .updateTable('devices as d')
      .set({ machineGroupId: groupId })
      .where('d.deviceId', 'in', deviceIds)
      .execute()
    await notifyUpdatedMachineGroups(tx)
    return machines
  }, db)
}

export async function getHighestRestrictionLevel(
  dbOrTx: DBOrTx = db,
): Promise<number> {
  const result = await dbOrTx
    .selectFrom('devices')
    .select(db => db.fn.max('restrictionLevel').as('maxRestrictionLevel'))
    .where('paired', '=', true)
    .executeTakeFirst()

  return result?.maxRestrictionLevel ?? 0
}
