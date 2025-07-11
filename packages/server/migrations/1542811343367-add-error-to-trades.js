var db = require('./db')

exports.up = function (next) {
  const sql = ['alter table trades add column error text']

  db.runAll(sql, next)
}

exports.down = function (next) {
  const sql = ['alter table trades drop column error']

  db.runAll(sql, next)
}
