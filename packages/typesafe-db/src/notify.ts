import { sql } from 'kysely'

import type { DBOrTx } from './db.js'

function notify(dbOrTx: DBOrTx, channel: string) {
  const sqlChannel = sql.id(channel)
  return sql`NOTIFY ${sqlChannel}`.execute(dbOrTx)
}

export function notifyReload(dbOrTx: DBOrTx) {
  return notify(dbOrTx, 'reload')
}
