const BN = require('../../bn')

function ticker() {
  return Promise.resolve({
    rates: {
      ask: new BN(105),
      bid: new BN(100),
    },
  })
}

module.exports = { ticker }
