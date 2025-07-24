const db = require('../db')
const state = require('./state')
const newSettingsLoader = require('../new-settings-loader')
const logger = require('../logger')

db.connect({ direct: true })
  .then(sco => {
    sco.client.on('notification', reload)
    return sco.none('LISTEN $1:name', 'reload')
  })
  .catch(console.error)

db.connect({ direct: true })
  .then(sco => {
    sco.client.on('notification', data => {
      const parsedData = JSON.parse(data.payload)
      return machineAction(parsedData.action, parsedData.value)
    })
    return sco.none('LISTEN $1:name', 'machineAction')
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

function reload() {
  state.needsSettingsReload = true
}

const populateSettings = function (req, res, next) {
  const { settingsCache } = state
  const versionId = req.headers['config-version']

  try {
    // Priority of configs to retrieve
    // 1. Machine is in the middle of a transaction and has the config-version header set, fetch that config from cache or database, depending on whether it exists in cache
    // 2. The operator settings changed, so we must update the cache
    // 3. There's a cached config, send the cached value
    // 4. There's no cached config, cache and send the latest config

    if (versionId) {
      const cachedVersionedSettings = settingsCache.get(versionId)

      if (!cachedVersionedSettings) {
        logger.debug('Fetching a specific config version cached value')
        return newSettingsLoader
          .loadWithAllTriggers(versionId)
          .then(settings => {
            settingsCache.set(versionId, settings)
            req.settings = settings
          })
          .then(() => next())
          .catch(next)
      }

      logger.debug('Fetching a cached specific config version')
      req.settings = cachedVersionedSettings
      return next()
    }

    const operatorSettings = settingsCache.get('latest')

    if (state.needsSettingsReload || !operatorSettings) {
      state.needsSettingsReload
        ? logger.debug(
            'Fetching and caching a new latest config value, as a reload was requested',
          )
        : logger.debug(
            "Fetching the latest config version because there's no cached value",
          )

      return newSettingsLoader
        .loadWithAllTriggers()
        .then(settings => {
          const versionId = settings.version
          settingsCache.set('latest', settings)
          settingsCache.set(versionId, settings)
          state.needsSettingsReload = false
          req.settings = settings
        })
        .then(() => next())
        .catch(next)
    }

    logger.debug('Fetching the latest config value from cache')
    req.settings = operatorSettings
    return next()
  } catch (e) {
    logger.error(e)
  }
}

module.exports = populateSettings
