var db = require('./db')

exports.up = function (next) {
  var sql = [
    "alter table cash_out_actions add device_id text not null default ''",
  ]
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
