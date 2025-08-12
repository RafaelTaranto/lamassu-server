const db = require('../db')
const state = require('./state')
const newSettingsLoader = require('../new-settings-loader')
const logger = require('../logger')

db.connect({ direct: true })
  .then(sco => {
    sco.client.on('notification', () => reloadCache())
    return sco.none('LISTEN reload')
  })
  .catch(console.error)

db.connect({ direct: true })
  .then(sco => {
    sco.client.on('notification', data => {
      const parsedData = JSON.parse(data.payload)
      return machineAction(parsedData.action, parsedData.value)
    })
    return sco.none('LISTEN machineAction')
  })
  .catch(console.error)

function machineAction(type, value) {
  const deviceId = value.deviceId
  const pid = state.pids?.[deviceId]?.pid

  switch (type) {
    case 'reboot':
      logger.debug(`Rebooting machine '${deviceId}'`)
      state.reboots[deviceId] = pid
      break
    case 'shutdown':
      logger.debug(`Shutting down machine '${deviceId}'`)
      state.shutdowns[deviceId] = pid
      break
    case 'restartServices':
      logger.debug(`Restarting services of machine '${deviceId}'`)
      state.restartServicesMap[deviceId] = pid
      break
    case 'emptyUnit':
      logger.debug(`Emptying units from machine '${deviceId}'`)
      state.emptyUnit[deviceId] = pid
      break
    case 'refillUnit':
      logger.debug(`Refilling recyclers from machine '${deviceId}'`)
      state.refillUnit[deviceId] = pid
      break
    case 'diagnostics':
      logger.debug(`Running diagnostics on machine '${deviceId}'`)
      state.diagnostics[deviceId] = pid
      break
    default:
      break
  }
}

const updateCache = (versionId, settings) => {
  const { settingsCache } = state
  settingsCache.set(settings.version, settings)
  if (!versionId) settingsCache.set('latest', settings)
  return settings
}

const reloadCache = async versionId => {
  const settings = await newSettingsLoader.load(versionId)
  return updateCache(versionId, settings)
}

const getOrUpdateCached = async versionId =>
  state.settingsCache.get(versionId || 'latest') ||
  (await reloadCache(versionId))

const populateSettings = function (req, res, next) {
  const versionId = req.headers['config-version']

  // Priority of configs to retrieve
  // 1. Machine is in the middle of a transaction and has the config-version header set, fetch that config from cache or database, depending on whether it exists in cache
  // 2. The operator settings changed, so we must update the cache
  // 3. There's a cached config, send the cached value
  // 4. There's no cached config, cache and send the latest config
  getOrUpdateCached(versionId)
    .then(settings => {
      req.settings = settings
      next()
    })
    .catch(next)
}

module.exports = populateSettings
