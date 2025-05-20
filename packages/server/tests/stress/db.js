const { spawnSync } = require('node:child_process')
const { join } = require('node:path')

require('../../lib/environment-helper')
const db = require('../../lib/db')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message =
  'Setup the DB according to the previously defined environment.'

const cli = CLI({
  grammar: [[['--help'], 'Show this help message']],
})

const help = exit_code => {
  console.log('Usage: lamassu-server-stress-testing db ARGS...')
  console.log(help_message)
  cli.help()
  return exit_code
}

const migrate = async () => {
  const lamassu_migrate_path = join(__dirname, '../../bin/lamassu-migrate')
  const { stdout, stderr, status, signal, error } = spawnSync(
    lamassu_migrate_path,
    [],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  if (typeof status !== 'number' || typeof signal === 'string' || error) {
    console.error('stdout:', stdout)
    console.error('stderr:', stderr)
    console.error('status:', status)
    console.error('signal:', signal)
    console.error('error:', error)
    return EXIT.EXCEPTION
  } else {
    return EXIT.OK
  }
}

const configure = async () => {
  const config =
    '{"config":{"triggersConfig_expirationTime":"Forever","triggersConfig_automation":"Automatic","locale_timezone":"Pacific/Honolulu","cashIn_cashboxReset":"Manual","notifications_email_security":true,"notifications_sms_security":true,"notifications_notificationCenter_security":true,"wallets_advanced_feeMultiplier":"1","wallets_advanced_cryptoUnits":"full","wallets_advanced_allowTransactionBatching":false,"wallets_advanced_id":"c5e3e61e-71b2-4200-9851-0142db7e6797","triggersConfig_customerAuthentication":"SMS","commissions_cashOutFixedFee":1,"machineScreens_rates_active":true,"wallets_BTC_zeroConfLimit":0,"wallets_BTC_coin":"BTC","wallets_BTC_wallet":"mock-wallet","wallets_BTC_ticker":"mock-ticker","wallets_BTC_exchange":"mock-exchange","wallets_BTC_zeroConf":"none","locale_id":"5f18e5ae-4a5d-45b2-8184-a6d69f4cc237","locale_country":"US","locale_fiatCurrency":"USD","locale_languages":["en-US","ja-JP","de-DE"],"locale_cryptoCurrencies":["BTC"],"commissions_minimumTx":2,"commissions_fixedFee":3,"commissions_cashOut":4,"commissions_cashIn":5,"commissions_id":"06d11aaa-34e5-45ab-956b-9728ccfd9330"}}'
  await db.none(
    "INSERT INTO user_config (type, data, created, valid, schema_version) VALUES ('config', $1, now(), 't', 2)",
    [config],
  )
  return EXIT.OK
}

const run = async args => {
  const [err, options] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help) return help(EXIT.OK)

  const funcs = [migrate, configure]
  for (let func of funcs) {
    const exit_code = await func()
    if (exit_code !== EXIT.OK) return exit_code
  }

  return EXIT.OK
}

module.exports = {
  help_message,
  run,
}
