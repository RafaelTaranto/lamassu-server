import type { Json } from './types/types.js'
import type { DBOrTx } from './db.js'
import { inTransaction } from './db.js'
import { notifyReload } from './notify.js'

const NEW_SETTINGS_LOADER_SCHEMA_VERSION = 2

function getRow(
  dbOrTx: DBOrTx,
  type: 'accounts' | 'config',
  options?: { schemaVersion?: number; version?: number },
) {
  const { schemaVersion, version } = options ?? {}

  let query = dbOrTx
    .selectFrom('userConfig as uc')
    .select(['uc.id', 'uc.data'])
    .where('uc.type', '=', type)
    .where(
      'uc.schemaVersion',
      '=',
      schemaVersion ?? NEW_SETTINGS_LOADER_SCHEMA_VERSION,
    )
    .where('uc.valid', '=', true)
    .orderBy('uc.id', 'desc')
    .limit(1)

  if (version) query = query.where('uc.id', '=', version)

  return query
}

export function insertConfigRow(dbOrTx: DBOrTx, config: object) {
  return dbOrTx
    .insertInto('userConfig')
    .values({
      type: 'config',
      data: JSON.stringify(config),
      valid: true,
      schemaVersion: NEW_SETTINGS_LOADER_SCHEMA_VERSION,
    })
    .execute()
}

function _loadConfigWithVersion(
  dbOrTx: DBOrTx,
  schemaVersion?: number,
  version?: number,
) {
  return getRow(dbOrTx, 'config', { schemaVersion, version })
    .execute()
    .then(([row]) => ({
      config:
        (row.data as { id: number; config: object } | undefined)?.config ?? {},
      version: row?.id,
    }))
}

export function loadAccounts(dbOrTx: DBOrTx, schemaVersion?: number) {
  return getRow(dbOrTx, 'accounts', { schemaVersion })
    .execute()
    .then(
      ([row]) =>
        (row.data as { id: number; accounts: object } | undefined)?.accounts ??
        {},
    )
}

export function loadConfig(dbOrTx: DBOrTx, schemaVersion?: number) {
  return _loadConfigWithVersion(dbOrTx, schemaVersion).then(
    ({ config }) => config,
  )
}

export async function load(dbOrTx: DBOrTx, version?: number) {
  const config = await _loadConfigWithVersion(
    dbOrTx,
    NEW_SETTINGS_LOADER_SCHEMA_VERSION,
    version,
  )
  const accounts = await loadAccounts(dbOrTx)
  return {
    config: config.config,
    accounts,
    version: config.version,
  }
}

function updateAccounts(dbOrTx: DBOrTx, accounts: Json) {
  return dbOrTx
    .updateTable('userConfig')
    .set({
      data: accounts,
      valid: true,
      schemaVersion: NEW_SETTINGS_LOADER_SCHEMA_VERSION,
    })
    .where('type', '=', 'accounts')
    .execute()
}

function insertAccounts(dbOrTx: DBOrTx, accounts: Json) {
  return dbOrTx
    .insertInto('userConfig')
    .columns(['type', 'data', 'valid', 'schemaVersion'])
    .expression(eb =>
      eb
        .selectFrom('userConfig as uc')
        .select([
          eb.val('accounts').as('type'),
          eb.val(accounts).as('data'),
          eb.val(true).as('valid'),
          eb.val(NEW_SETTINGS_LOADER_SCHEMA_VERSION).as('schemaVersion'),
        ])
        .where(({ not, exists, selectFrom }) =>
          not(
            exists(
              selectFrom('userConfig as uc')
                .select('uc.type')
                .where('uc.type', '=', 'accounts'),
            ),
          ),
        ),
    )
    .execute()
}

export function saveAccounts(
  dbOrTx: DBOrTx,
  mergeAccounts: (old: object) => Json,
  operatorId: string,
) {
  return inTransaction(dbOrTx, async tx => {
    const currentAccounts = await loadAccounts(tx)
    const newAccounts = mergeAccounts(currentAccounts)
    await updateAccounts(tx, newAccounts)
    await insertAccounts(tx, newAccounts)
    await notifyReload(tx, operatorId)
    return newAccounts
  })
}
