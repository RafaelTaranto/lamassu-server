const mem = require('mem')
const { machines } = require('typesafe-db')

// Cache configuration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000

const _getHighestRestrictionLevel = async () => {
  return machines.getHighestRestrictionLevel()
}

const getCachedRestrictionLevel = mem(_getHighestRestrictionLevel, {
  maxAge: CACHE_DURATION,
  cacheKey: () => '',
})

module.exports = {
  getCachedRestrictionLevel,
}
