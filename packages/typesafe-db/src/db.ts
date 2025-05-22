import { DB } from './types/types.js'
import { Pool } from 'pg'
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'
import { PSQL_URL } from 'lamassu-server/lib/constants.js'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: PSQL_URL,
    max: 5,
  }),
})

export default new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
  log(event) {
    if (event.level === 'query') {
      console.log('Query:', event.query.sql)
      console.log('Parameters:', event.query.parameters)
      console.log('Duration:', event.queryDurationMillis + 'ms')
      console.log('---')
    }
  },
})
