const db = require('./db')

function getOperatorId(service) {
  const sql = 'SELECT operator_id FROM operator_ids WHERE service = ${service}'
  return db.oneOrNone(sql, { service }, ({ operator_id }) => operator_id)
}

module.exports = { getOperatorId }
