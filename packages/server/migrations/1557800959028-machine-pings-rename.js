const db = require('./db')

exports.up = function (next) {
  var sql = ['ALTER TABLE machine_pings RENAME COLUMN created to updated']

  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
