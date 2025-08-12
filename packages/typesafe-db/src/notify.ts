import { sql } from 'kysely'

import type { DBOrTx } from './db.js'

function notify(dbOrTx: DBOrTx, channel: string) {
  const sqlChannel = sql.id(channel)
  return sql`NOTIFY ${sqlChannel}`.execute(dbOrTx)
}

export function notifyReload(dbOrTx: DBOrTx) {
  return notify(dbOrTx, 'reload')
}

export function notifyUpdatedMachineGroups(dbOrTx: DBOrTx) {
  return notify(dbOrTx, 'updated_machine_groups')
}

export function notifyUpdatedComplianceTriggerSets(dbOrTx: DBOrTx) {
  return notify(dbOrTx, 'updated_compliance_trigger_sets')
}

export function notifyUpdatedComplianceTriggers(dbOrTx: DBOrTx) {
  return notify(dbOrTx, 'updated_compliance_triggers')
}
