const supervisor = require('../../services/supervisor')
const {
  getCachedRestrictionLevel,
} = require('../../services/restriction-level')

const resolvers = {
  Query: {
    uptime: () => supervisor.getAllProcessInfo(),
    restrictionLevel: () => getCachedRestrictionLevel(),
  },
}

module.exports = resolvers
