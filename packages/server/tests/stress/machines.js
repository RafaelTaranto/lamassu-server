const { createWriteStream } = require('node:fs')
const { EOL } = require('node:os')

require('../../lib/environment-helper')
const db = require('../../lib/db')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = 'Create and insert fake machines into the DB.'

const cli = CLI({
  grammar: [
    [['--help'], 'Show this help message'],
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

const leftpad = (s, w, c) => c.repeat(Math.max(w - s.length, 0)) + s

function* chunk(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

const fake_machine_id = i => 'machine_' + i

const save_machines_to_db = async (machines, replace_existing) => {
  if (replace_existing) await db.none('DELETE FROM devices')

  console.log('inserting machines into DB')
  for (const ids of chunk(machines, 20))
    await db.tx(tx =>
      tx.batch(
        ids.map(device_id =>
          tx.none(
            `INSERT INTO devices (device_id, cassette1, cassette2, paired, display, created, name, last_online, location)
           VALUES ($1, 0, 0, 't', 't', now(), $1, now(), '{}'::json)`,
            [device_id],
          ),
        ),
      ),
    )
}

const save_device_ids_to_file = async (
  machines,
  { device_ids_path, replace_existing },
) => {
  const device_ids_file = createWriteStream(device_ids_path, {
    flags: replace_existing ? 'w' : 'a',
    mode: 0o640,
    flush: true,
  })

  console.log('saving machine IDs to file')
  for (const ids of chunk(machines, 20))
    await device_ids_file.write(ids.join(EOL) + EOL)

  await close_stream(device_ids_file)
}

const create_fake_machines = async ({
  device_ids_path,
  n,
  replace_existing,
}) => {
  n = parseInt(n)
  if (Number.isNaN(n) || n <= 0) {
    console.error('Expected n to be a positive number, got', n)
    return help(EXIT.BADARGS)
  }
  const width = Math.log10(n)

  const machines = Array(n)
    .fill(0)
    .map((x, i) => fake_machine_id(leftpad(i.toString(), width, '0')))
  await save_machines_to_db(machines, replace_existing)
  await save_device_ids_to_file(machines, { device_ids_path, replace_existing })

  return EXIT.OK
}

const run = async args => {
  const [err, options] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help) return help(EXIT.OK)

  const missing_options = ['n', 'device_ids_path'].filter(opt => !options[opt])
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
