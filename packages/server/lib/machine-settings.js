const NodeCache = require('node-cache')

const {
  db: { default: kdb, inTransaction },
  machines: { getMachinesGroups },
  machineGroups: { getMachineGroupsComplianceTriggerSets },
  complianceTriggers: { getAllComplianceTriggers },
} = require('typesafe-db')

const db = require('./db')
const logger = require('./logger')

db.connect({ direct: true }).then(sco => {
  sco.client.on('notification', () => reloadAll())
  return sco.none('LISTEN updated_machine_groups')
})

db.connect({ direct: true }).then(sco => {
  sco.client.on('notification', () => reloadAll())
  return sco.none('LISTEN updated_compliance_trigger_sets')
})

db.connect({ direct: true }).then(sco => {
  sco.client.on('notification', () => reloadAll())
  return sco.none('LISTEN updated_compliance_triggers')
})

// Make any given psudo real time clock strictly monotonic
const StrictlyMonotonicPseudoRealTimeClock = opts => {
  let last = opts?.last ?? 0
  const now = opts?.now ?? Date.now
  return () => (last = Math.max(last + 1, now()))
}

const timestamp = StrictlyMonotonicPseudoRealTimeClock()

const TTL = 3600 // 1h in seconds
const CACHE = new NodeCache({
  stdTTL: TTL,
  checkperiod: TTL / 3,
})

const KEY = 0

const get = () => CACHE.get(KEY)
const set = val => CACHE.set(KEY, val)

CACHE.on('expired', (key, value) => {
  reloadAll(value)
})

const oneAtATime = func => {
  let running = null

  // Wait for the function to finish, resolve with its result, and clear the
  // running promise. Resolving a reject results in a reject.
  const stop = res => resolve =>
    Promise.resolve(res)
      .then(resolve)
      .finally(() => {
        running = null
      })

  // If the function is running, return the current promise. Otherwise, create
  // a new promise and run the function.
  return (...args) => running || (running = new Promise(stop(func(...args))))
}

const getTriggersByMachine = (machines, machineGroups, complianceTriggers) => {
  const triggersBySet = Object.groupBy(
    complianceTriggers,
    t => t.complianceTriggerSetId,
  )

  const triggersByGroup = Object.fromEntries(
    machineGroups.map(({ id, complianceTriggerSetId }) => [
      id,
      // Machine groups with no compliance trigger set have no compliance triggers.
      complianceTriggerSetId ? triggersBySet[complianceTriggerSetId] : [],
    ]),
  )

  return Object.fromEntries(
    machines.map(({ deviceId, machineGroupId }) => [
      deviceId,
      triggersByGroup[machineGroupId],
    ]),
  )
}

const reloadAll = oneAtATime(oldCache => {
  const ts = timestamp()
  oldCache ??= get() // oldCache is given only on `expired`
  oldCache ??= [null, {}] // the cache is empty on the first reload

  const ret = inTransaction(
    async tx => [
      await getMachinesGroups(tx),
      await getMachineGroupsComplianceTriggerSets(tx),
      await getAllComplianceTriggers(tx),
    ],
    kdb,
  )
    .then(([machines, machineGroups, complianceTriggers]) => [
      ts,
      getTriggersByMachine(machines, machineGroups, complianceTriggers),
    ])
    .catch(err => {
      logger.error(err)
      logger.info(
        'Reloading machine settings cache failed; using previous cache',
      )
      return oldCache
    })

  set(ret)
  return ret
})

const getFromPromise = async (cachePromise, deviceId) => {
  if (!cachePromise) return null
  const [settingsVersion, cache] = await cachePromise
  const complianceTriggers = cache[deviceId]
  if (!complianceTriggers) return null
  return { settingsVersion, complianceTriggers }
}

const getOrUpdate = async (deviceId, machineVersion) => {
  let settings =
    (await getFromPromise(get(), deviceId)) ??
    (await getFromPromise(reloadAll(), deviceId))

  if (!settings)
    throw new Error(`Compliance triggers cache has no entry for ${deviceId}`)

  if (machineVersion && settings.settingsVersion < machineVersion)
    throw new Error(`Compliance triggers cache is older than ${deviceId}`)

  return settings
}

module.exports = {
  reloadAll,
  getOrUpdate,
}
