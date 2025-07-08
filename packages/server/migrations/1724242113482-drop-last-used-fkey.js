const db = require('./db')

exports.up = function (next) {
  db.runAll(
    ['ALTER TABLE customers DROP CONSTRAINT customers_last_used_machine_fkey;'],
    next,
  )
}

exports.down = function (next) {
  next()
}
