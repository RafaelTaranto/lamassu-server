const _ = require('lodash/fp')
const db = require('./db')

const NEW_SETTINGS_LOADER_SCHEMA_VERSION = 2

const insertConfigRow = (dbOrTx, data) =>
  dbOrTx.none(
    "INSERT INTO user_config (type, data, valid, schema_version) VALUES ('config', $1, TRUE, $2)",
    [data, NEW_SETTINGS_LOADER_SCHEMA_VERSION],
  )

function removeFromConfig(fields) {
  return loadConfig().then(currentConfig => {
    const newConfig = _.omit(fields, currentConfig)
    return insertConfigRow(db, { config: newConfig }).catch(console.error)
  })
}

const loadConfig = () => {
  const sql = `SELECT data
    FROM user_config
    WHERE type = 'config'
      AND schema_version = $1
      AND valid
    ORDER BY id DESC
    LIMIT 1`

  return db
    .oneOrNone(sql, [NEW_SETTINGS_LOADER_SCHEMA_VERSION])
    .then(row => row?.data?.config ?? {})
}

function saveConfig(config) {
  return loadConfig().then(currentConfig => {
    const newConfig = Object.assign({}, currentConfig, config)
    return insertConfigRow(db, { config: newConfig }).catch(console.error)
  })
}

function loadAccounts(schemaVersion) {
  const sql = `SELECT data
    FROM user_config
    WHERE type = 'accounts'
      AND schema_version = $1
      AND valid
    ORDER BY id DESC
    LIMIT 1`

  return db.oneOrNone(
    sql,
    [schemaVersion || NEW_SETTINGS_LOADER_SCHEMA_VERSION],
    row => row?.data?.accounts ?? {},
  )
}

function saveAccounts(accounts) {
  if (!accounts) {
    return Promise.resolve()
  }

  const mergeAccounts = currentAccounts => {
    const newAccounts = _.merge(currentAccounts, accounts)

    // Only allow one wallet scoring active at a time
    if (accounts.elliptic?.enabled && newAccounts.scorechain) {
      newAccounts.scorechain.enabled = false
    }

    if (accounts.scorechain?.enabled && newAccounts.elliptic) {
      newAccounts.elliptic.enabled = false
    }

    return newAccounts
  }

  const accountsSql = `UPDATE user_config SET data = $1, valid = TRUE, schema_version = $2 WHERE type = 'accounts';
  INSERT INTO user_config (type, data, valid, schema_version)
  SELECT 'accounts', $1, TRUE, $2 WHERE 'accounts' NOT IN (SELECT type FROM user_config)`

  return loadAccounts().then(currentAccounts => {
    db.none(accountsSql, [
      { accounts: mergeAccounts(currentAccounts) },
      NEW_SETTINGS_LOADER_SCHEMA_VERSION,
    ])
  })
}

module.exports = {
  loadConfig,
  removeFromConfig,
  saveConfig,
  loadAccounts,
  saveAccounts,
}
