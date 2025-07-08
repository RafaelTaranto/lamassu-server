const db = require('./db')

exports.up = function (next) {
  var sql = ['ALTER TABLE user_tokens ADD COLUMN last_accessed timestamptz']

  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
