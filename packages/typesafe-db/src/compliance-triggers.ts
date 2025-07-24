import type { Insertable } from 'kysely'

import type { DBOrTx } from './db.js'
import type { ComplianceTriggers, RequirementType } from './types/types.js'
import { inTransaction } from './db.js'
import {
  notifyUpdatedComplianceTriggerSets,
  notifyUpdatedComplianceTriggers,
} from './notify.js'

type ComplianceTriggerInsert = Insertable<ComplianceTriggers>

/*
 * Deprecated API
 */

export function getAllComplianceTriggers(dbOrTx: DBOrTx) {
  return dbOrTx.selectFrom('complianceTriggers').selectAll().execute()
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
  return inTransaction(async tx => {
    const complianceTriggerSet = await tx
      .deleteFrom('complianceTriggerSets')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
    await notifyUpdatedComplianceTriggerSets(tx)
    return complianceTriggerSet
  }, dbOrTx)
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
  return inTransaction(async tx => {
    const complianceTrigger = await tx
      .insertInto('complianceTriggers')
      .values(Object.assign({}, trigger, { complianceTriggerSetId }))
      .execute()
    await notifyUpdatedComplianceTriggers(tx)
    return complianceTrigger
  }, dbOrTx)
}

export function deleteComplianceTrigger(dbOrTx: DBOrTx, id: string) {
  return inTransaction(async tx => {
    const complianceTrigger = await tx
      .deleteFrom('complianceTriggers')
      .where('id', '=', id)
      .execute()
    await notifyUpdatedComplianceTriggers(tx)
    return complianceTrigger
  }, dbOrTx)
}

export function deleteComplianceTriggersByCustomInfoRequestId(
  dbOrTx: DBOrTx,
  customInfoRequestId: string,
) {
  return inTransaction(async tx => {
    const complianceTrigger = await tx
      .deleteFrom('complianceTriggers')
      .where('customInfoRequestId', '=', customInfoRequestId)
      .execute()
    await notifyUpdatedComplianceTriggers(tx)
    return complianceTrigger
  }, dbOrTx)
}

export function getAllComplianceTriggersByRequirementType(
  dbOrTx: DBOrTx,
  requirementType: RequirementType,
) {
  return dbOrTx
    .selectFrom('complianceTriggers')
    .selectAll()
    .where('requirementType', '=', requirementType)
    .execute()
}
