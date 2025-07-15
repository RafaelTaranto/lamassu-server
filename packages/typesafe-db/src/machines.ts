import db from './db.js'

export function assignMachinesToGroup(deviceIds: [string], groupId: string) {
  return db
    .updateTable('devices as d')
    .set({ machineGroupId: groupId })
    .where('d.deviceId', 'in', deviceIds)
    .execute()
}
