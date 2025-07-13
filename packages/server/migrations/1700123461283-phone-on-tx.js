const db = require('./db')

exports.up = function (next) {
  let sql = [
    'ALTER TABLE cash_in_txs ADD COLUMN email text',
    'ALTER TABLE cash_out_txs ADD COLUMN email text',
  ]

  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
