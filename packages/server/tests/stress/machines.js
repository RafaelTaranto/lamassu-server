const { createHash } = require('node:crypto')
const { createWriteStream } = require('node:fs')
const { EOL } = require('node:os')
const { join } = require('node:path')

require('../../lib/environment-helper')
const db = require('../../lib/db')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = 'Create and insert fake machines into the DB.'

const cli = CLI({
  grammar: [
    [['--help'], 'Show this help message'],
    [['--machine', 'PATH'], "Path to the machine's source code root"],
    [['--device_ids_path', 'PATH'], 'Where to save the list of device IDs'],
    [['-n', 'NUMBER'], 'Number of fake machines to create'],
    [['--replace_existing'], 'Remove machines of previous runs'],
  ],
})

const help = exit_code => {
  console.log('Usage: lamassu-server-stress-testing machines ARGS...')
  console.log(help_message)
  cli.help()
  return exit_code
}

const close_stream = stream =>
  new Promise((resolve, reject) =>
    stream.close(err => (err ? reject(err) : resolve())),
  )

const compute_machine_id = cert => {
  cert = cert.split('\r\n')
  const raw = Buffer.from(cert.slice(1, cert.length - 2).join(''), 'base64')
  return createHash('sha256').update(raw).digest('hex')
}

const create_fake_machine = async (device_ids_file, self_sign, i) => {
  console.log('creating machine', i)
  const { cert } = await self_sign.generateCertificate()
  const device_id = compute_machine_id(cert)
  await db.none(
    `INSERT INTO devices (device_id, cassette1, cassette2, paired, display, created, name, last_online, location)
     VALUES ($1, 0, 0, 't', 't', now(), $2, now(), '{}'::json)`,
    [device_id, `machine_${i}`],
  )
  device_ids_file.write(device_id + EOL)
  console.log('created machine', i, 'with device ID', device_id)
}

const create_fake_machines = async ({
  machine,
  device_ids_path,
  n,
  replace_existing,
}) => {
  n = parseInt(n)
  if (Number.isNaN(n) || n <= 0) {
    console.error('Expected n to be a positive number, got', n)
    return help(EXIT.BADARGS)
  }

  const device_ids_file = createWriteStream(device_ids_path, {
    flags: replace_existing ? 'w' : 'a',
    mode: 0o640,
    flush: true,
  })
  if (replace_existing) await db.none('DELETE FROM devices')

  const self_sign = require(join(process.cwd(), machine, 'lib', 'self_sign'))
  for (let i = 0; i < n; i++)
    await create_fake_machine(device_ids_file, self_sign, i)

  await close_stream(device_ids_file)

  return EXIT.OK
}

const run = async args => {
  const [err, options] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help) return help(EXIT.OK)

  const missing_options = ['n', 'machine', 'device_ids_path'].filter(
    opt => !options[opt],
  )
  if (missing_options.length > 0) {
    console.error(
      'The following options are required:',
      missing_options.join(', '),
    )
    return help(EXIT.BADARGS)
  }

  return await create_fake_machines(options)
}

module.exports = {
  help_message,
  run,
}
