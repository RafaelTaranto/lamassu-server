const db = require('./db')

exports.up = function (next) {
  const sql = ['alter table devices drop column name']
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
