var db = require('./db')

exports.up = function (next) {
  var sqls = [
    'alter table transactions alter satoshis TYPE bigint',
    "alter table transactions add crypto_code text default 'BTC'",
    "alter table pending_transactions add crypto_code text default 'BTC'",
    'alter table pending_transactions alter satoshis TYPE bigint',
    "alter table bills add crypto_code text default 'BTC'",
    'alter table bills alter satoshis TYPE bigint',
  ]

  db.runAll(sqls, next)
}

exports.down = function (next) {
  next()
}
