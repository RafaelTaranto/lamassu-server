const db = require('./db')

exports.up = function (next) {
  var sql = ['ALTER TABLE customers ADD COLUMN suspended_until timestamptz']

  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
