const { fork } = require('node:child_process')
const { createHash } = require('node:crypto')
const { mkdirSync, rmSync } = require('node:fs')
const { readFile } = require('node:fs/promises')
const { join } = require('node:path')

require('../../lib/environment-helper')
const db = require('../../lib/db')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = "Create and insert fake machines into the DB."

const cli = CLI({
  grammar: [
    [["--help"], "Show this help message"],
    [["--machine", "PATH"], "Path to the machine's source code root"],
    [["--fake_data_dir", "PATH"], "Where to save the fake machines' data"],
    [["-n", "NUMBER"], "Number of fake machines to create"],
    [["--replace_existing"], "Remove machines of previous runs"],
  ],
})

const help = (exit_code) => {
  console.log("Usage: lamassu-server-stress-testing machines ARGS...")
  console.log(help_message)
  cli.help()
  return exit_code
}

const compute_machine_id = pem_path => (
  readFile(pem_path, { encoding: 'utf8' })
    .then(cert => cert.split('\r\n'))
    .then(cert => Buffer.from(cert.slice(1, cert.length-2).join(''), 'base64'))
    .then(raw => createHash('sha256').update(raw).digest('hex'))
)

const create_fake_machine = async (gencerts_path, machine_data_dir, i) => (
  new Promise((resolve, reject) => {
    mkdirSync(machine_data_dir, { recursive: true, mode: 0o750 })
  
    console.log("Creating fake machine number", i)
    const gc = fork(gencerts_path, [machine_data_dir], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })

    gc.on('error', (error) => {
      console.log(error)
      resolve(EXIT.EXCEPTION)
    })

    gc.on('exit', (code, signal) => {
      console.error("lamassu-server code:", code)
      console.error("lamassu-server signal:", signal)
      resolve(typeof(code) === 'number' ? code : EXIT.EXCEPTION)
    })
  })
)

const create_fake_machines = async ({ machine, fake_data_dir, n, replace_existing }) => {
  n = parseInt(n)
  if (Number.isNaN(n) || n <= 0) {
    console.error("Expected n to be a positive number, got", n)
    return help(EXIT.BADARGS)
  }

  if (replace_existing) {
    rmSync(fake_data_dir, { recursive: true, force: true })
    await db.none("DELETE FROM devices")
  }

  /* Create the root data directory */
  mkdirSync(fake_data_dir, { recursive: true, mode: 0o750 })

  const gencerts_path = join(machine, "tools", "generate-certificates")
  for (let i = 0; i < n; i++) {
    const machine_data_dir = join(fake_data_dir, i.toString())
    const exit_code = await create_fake_machine(gencerts_path, machine_data_dir, i)
    if (exit_code !== EXIT.OK)
      return exit_code

    const device_id = await compute_machine_id(join(machine_data_dir, "client.pem"))

    await db.none(
      `INSERT INTO devices (device_id, cassette1, cassette2, paired, display, created, name, last_online, location)
       VALUES ($1, 0, 0, 't', 't', now(), $2, now(), '{}'::json)`,
      [device_id, `machine_${i}`]
    )
  }

  return EXIT.OK
}

const run = async (args) => {
  const [err, options, positional] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help)
    return help(EXIT.OK)

  const missing_options = ["n", "machine", "fake_data_dir"].filter((opt) => !options[opt])
  if (missing_options.length > 0) {
    console.error("The following options are required:", missing_options.join(", "))
    return help(EXIT.BADARGS)
  }

  return await create_fake_machines(options)
}

module.exports = {
  help_message,
  run,
}
