import type { DB } from './types/types.js'

import { Pool } from 'pg'
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'

const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_HOST = process.env.POSTGRES_HOST
const POSTGRES_PORT = process.env.POSTGRES_PORT
const POSTGRES_DB = process.env.POSTGRES_DB

const PSQL_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: PSQL_URL,
    max: 5,
  }),
})

export type DBOrTx = Kysely<DB>

const db: Kysely<DB> = new Kysely<DB>({
  dialect,
  plugins: [
    new CamelCasePlugin({
      maintainNestedObjectKeys: true,
      underscoreBeforeDigits: true,
    }),
  ],
})

export default db

export function inTransaction<DB, T>(
  func: (tx: Kysely<DB>) => Promise<T>,
  dbOrTx: Kysely<DB>, // TODO: default to `db`
): Promise<T> {
  return dbOrTx.isTransaction
    ? func(dbOrTx)
    : dbOrTx.transaction().execute(func)
}
