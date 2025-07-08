var db = require('./db')

exports.up = function (next) {
  var sql = [
    'alter table cash_out_txs add column provisioned_1 integer',
    'alter table cash_out_txs add column provisioned_2 integer',
    'alter table cash_out_txs add column denomination_1 integer',
    'alter table cash_out_txs add column denomination_2 integer',
  ]
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
