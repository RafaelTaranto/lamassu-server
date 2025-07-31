import { sql } from 'kysely'

import type { DBOrTx } from './db.js'

export async function notifyReload(dbOrTx: DBOrTx, operatorId: string) {
  const notification = sql.lit(JSON.stringify({ operatorId }))
  await sql`NOTIFY reload, ${notification}`.execute(dbOrTx)
}
