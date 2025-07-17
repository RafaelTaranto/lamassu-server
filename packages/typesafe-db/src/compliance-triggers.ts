import { Insertable } from 'kysely'

import { inTransaction, DBOrTx } from './db.js'
import { ComplianceTriggers } from './types/types.js'

type ComplianceTriggerInsert = Insertable<ComplianceTriggers>

export function getAllComplianceTriggers(dbOrTx: DBOrTx) {
  return dbOrTx.selectFrom('complianceTriggers').selectAll().execute()
}

export function saveAllComplianceTriggers(
  dbOrTx: DBOrTx,
  triggers: ComplianceTriggerInsert[],
) {
  return inTransaction(dbOrTx, async tx => {
    await tx.deleteFrom('complianceTriggers').execute()
    return await tx.insertInto('complianceTriggers').values(triggers).execute()
  })
}
