const _ = require('lodash/fp')
const pgp = require('pg-promise')()

const db = require('../../db')

const AND = (...clauses) => clauses.filter(clause => !!clause).join(' AND ')

const getBatchIDCondition = filter => {
  switch (filter) {
    case 'none':
      return 'b.cashbox_batch_id IS NULL'
    case 'any':
      return 'b.cashbox_batch_id IS NOT NULL'
    default:
      return _.isNil(filter)
        ? ''
        : `b.cashbox_batch_id = ${pgp.as.text(filter)}`
  }
}

const getBills = filters => {
  const deviceIDCondition = !_.isNil(filters.deviceId)
    ? `device_id = ${pgp.as.text(filters.deviceId)}`
    : ''
  const batchIDCondition = getBatchIDCondition(filters.batch)

  const cashboxBills = `SELECT b.id, b.fiat, b.fiat_code, b.created, b.cashbox_batch_id, cit.device_id AS device_id
  FROM bills b
  LEFT OUTER JOIN (
    SELECT id, device_id
    FROM cash_in_txs
    WHERE ${AND(
      deviceIDCondition,
      'device_id NOT IN (SELECT device_id FROM unpaired_devices)',
    )}
  ) AS cit
  ON cit.id = b.cash_in_txs_id
  WHERE ${AND(
    batchIDCondition,
    "b.destination_unit = 'cashbox'",
    'cit.device_id IS NOT NULL',
  )}`

  const recyclerBills = `SELECT b.id, b.fiat, b.fiat_code, b.created, b.cashbox_batch_id, b.device_id
  FROM empty_unit_bills b
  WHERE ${AND(
    deviceIDCondition,
    batchIDCondition,
    'b.device_id NOT IN (SELECT device_id FROM unpaired_devices)',
  )}`

  return Promise.all([db.any(cashboxBills), db.any(recyclerBills)]).then(
    ([cashboxBills, recyclerBills]) =>
      [].concat(cashboxBills, recyclerBills).map(_.mapKeys(_.camelCase)),
  )
}

module.exports = {
  getBills,
}
