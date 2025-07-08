var db = require('./db')

exports.up = function (next) {
  var sql = [
    'alter table transactions add phone text',
    'create index on transactions (phone)',
  ]
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
