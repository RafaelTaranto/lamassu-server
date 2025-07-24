const BN = require('../../bn')

function ticker() {
  return Promise.resolve({
    rates: {
      ask: new BN(100),
      bid: new BN(95),
    },
  })
}

module.exports = { ticker }
