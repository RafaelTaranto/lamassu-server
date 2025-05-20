const _ = require('lodash/fp')

const NAME = 'MockSMS'

function sendMessage(account, rec) {
  console.log('Sending SMS: %j', rec)
  return new Promise((resolve, reject) => {
    if (_.endsWith('666', _.getOr(false, 'sms.toNumber', rec))) {
      reject(new Error(`${exports.NAME} mocked error!`))
    } else {
      setTimeout(resolve, 10)
    }
  })
}

module.exports = {
  NAME,
  sendMessage,
}
