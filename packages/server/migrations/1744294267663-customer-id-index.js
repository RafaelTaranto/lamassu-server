const db = require('./db')

exports.up = next =>
  db.multi(
    [
      `CREATE INDEX cash_in_txs_customer_id_idx ON cash_in_txs (customer_id);`,
      `CREATE INDEX cash_out_txs_customer_id_idx ON cash_out_txs (customer_id);`,
    ],
    next,
  )

exports.down = next => next()
