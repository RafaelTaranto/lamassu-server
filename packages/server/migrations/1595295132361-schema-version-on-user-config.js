const db = require('./db')

module.exports.up = function (next) {
  var sql = [
    'alter table user_config add column schema_version smallint not null DEFAULT 1',
  ]

  db.runAll(sql, next)
}

module.exports.down = function (next) {
  next()
}
