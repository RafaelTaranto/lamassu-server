const db = require('./db')

exports.up = next =>
  db.runAll(
    [
      'ALTER TABLE cash_out_txs ADD COLUMN fixed_fee numeric(14, 5) NOT NULL DEFAULT 0;',
    ],
    next,
  )

exports.down = next => next()
