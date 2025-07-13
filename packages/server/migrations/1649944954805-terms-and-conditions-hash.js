const { saveConfig } = require('./settings')

exports.up = function (next) {
  return saveConfig({}).then(next).catch(next)
}

exports.down = function (next) {
  next()
}
