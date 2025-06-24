export function logQuery(compiledQuery: {
  sql: string
  parameters: readonly unknown[]
}) {
  const { sql, parameters } = compiledQuery

  let interpolatedSql = sql
  let paramIndex = 0

  interpolatedSql = sql.replace(/\$\d+|\?/g, () => {
    const param = parameters[paramIndex++]

    if (param === null || param === undefined) {
      return 'NULL'
    } else if (typeof param === 'string') {
      return `'${param.replace(/'/g, "''")}'`
    } else if (typeof param === 'boolean') {
      return param.toString()
    } else if (param instanceof Date) {
      return `'${param.toISOString()}'`
    } else if (typeof param === 'object') {
      return `'${JSON.stringify(param).replace(/'/g, "''")}'`
    } else {
      return String(param)
    }
  })

  console.log('📝 Query:', interpolatedSql)
  return interpolatedSql
}
