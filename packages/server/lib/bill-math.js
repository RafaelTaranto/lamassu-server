const _ = require('lodash/fp')

const cc = require('./coin-change')

const getSolution = (units, amount) => {
  amount = amount.toNumber()
  units = Object.entries(
    units.reduce((avail, { denomination, count }) => {
      avail[denomination] ??= 0
      avail[denomination] += count
      return avail
    }, {}),
  )
  const model = cc.model(units)
  return cc.solve(model, amount)
}

const solutionToOriginalUnits = (solution, units) => {
  const billsToAssign = (count, left) =>
    _.clamp(0, count)(_.isNaN(left) || _.isNil(left) ? 0 : left)
  const billsLeft = Object.fromEntries(solution)
  return units.map(({ count, name, denomination }) => {
    const provisioned = billsToAssign(count, billsLeft[denomination])
    billsLeft[denomination] -= provisioned
    return { name, denomination, provisioned }
  })
}

function makeChange(outCassettes, amount) {
  const cc_solution = getSolution(outCassettes, amount)

  if (!cc.check(cc_solution, amount.toNumber())) {
    throw new Error('coin-change provided a bad solution')
  }

  return solutionToOriginalUnits(cc_solution, outCassettes)
}

module.exports = { makeChange }
