import { Insertable } from 'kysely'

import { inTransaction, DBOrTx } from './db.js'
import { ComplianceTriggers } from './types/types.js'

type ComplianceTriggerInsert = Insertable<ComplianceTriggers>

/*
 * Deprecated API
 */

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

/*
 * Compliance trigger sets API
 */

export function getComplianceTriggerSets(dbOrTx: DBOrTx) {
  return dbOrTx.selectFrom('complianceTriggerSets').selectAll().execute()
}

export function getComplianceTriggerSetById(dbOrTx: DBOrTx, id: string) {
  return dbOrTx
    .selectFrom('complianceTriggerSets')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirstOrThrow()
}

export function createComplianceTriggerSet(
  dbOrTx: DBOrTx,
  id: string,
  name: string,
) {
  return dbOrTx
    .insertInto('complianceTriggerSets')
    .values({ id, name })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function deleteComplianceTriggerSet(dbOrTx: DBOrTx, id: string) {
  return dbOrTx
    .deleteFrom('complianceTriggerSets')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

/*
 * Compliance triggers API with support for compliance trigger sets
 */

export function getComplianceTriggers(
  dbOrTx: DBOrTx,
  complianceTriggerSetId: string,
) {
  return dbOrTx
    .selectFrom('complianceTriggers')
    .selectAll()
    .where('complianceTriggerSetId', '=', complianceTriggerSetId)
    .execute()
}

export function createComplianceTrigger(
  dbOrTx: DBOrTx,
  complianceTriggerSetId: string,
  trigger: ComplianceTriggerInsert[],
) {
  return dbOrTx
    .insertInto('complianceTriggers')
    .values(Object.assign({}, trigger, { complianceTriggerSetId }))
    .execute()
}

export function deleteComplianceTrigger(dbOrTx: DBOrTx, id: string) {
  return dbOrTx.deleteFrom('complianceTriggers').where('id', '=', id).execute()
}
