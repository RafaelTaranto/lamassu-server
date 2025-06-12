const db = require('./db')

let operatorId = {}

function getOperatorId(service) {
  if (operatorId[service]) return Promise.resolve(operatorId[service])

  const sql = 'SELECT operator_id FROM operator_ids WHERE service = ${service}'
  return db.one(sql, { service }, ({ operator_id }) => {
    return (operatorId[service] = operator_id)
  })
}

module.exports = { getOperatorId }
