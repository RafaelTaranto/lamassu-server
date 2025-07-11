const { saveConfig } = require('./settings')

exports.up = function (next) {
  const triggersDefault = {
    triggersConfig_customerAuthentication: 'SMS',
  }

  return saveConfig(triggersDefault)
    .then(() => next())
    .catch(err => {
      console.log(err.message)
      return next(err)
    })
}

exports.down = function (next) {
  next()
}
