var db = require('./db')

exports.up = function (next) {
  var sql = ['alter table cash_out_txs add column error_code text']
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
