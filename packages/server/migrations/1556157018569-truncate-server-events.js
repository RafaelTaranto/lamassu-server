const db = require('./db')

exports.up = function (next) {
  var sql = ['TRUNCATE TABLE server_events']

  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
