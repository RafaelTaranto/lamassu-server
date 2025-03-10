const cp = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = "Setup fake machines to be used as stress test clients."

const cli = CLI({
  grammar: [
    [["--help"], "Show this help message"],
    [["--machine", "PATH"], "Path to the machine's source code root"],
    [["--fake_data_dir", "PATH"], "Where to save the fake machines' data"],
    [["-n", "NUMBER"], "Number of fake machines to create"],
  ],
})

const help = (exit_code) => {
  console.log("Usage: lamassu-server-stress-testing machines ARGS...")
  console.log(help_message)
  cli.help()
  return exit_code
}

const create_fake_machine = async (gencerts_path, fake_data_dir, i) =>
  new Promise((resolve, reject) => {
    const machine_data_dir = path.join(fake_data_dir, i.toString())
    fs.mkdirSync(machine_data_dir, { recursive: true, mode: 0o750 })
  
    console.log("Creating fake machine number", i)
    const gc = cp.fork(gencerts_path, [machine_data_dir], {
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

const create_fake_machines = async ({ machine, fake_data_dir, n }) => {
  n = parseInt(n)
  if (Number.isNaN(n) || n <= 0) {
    console.error("Expected n to be a positive number, got", n)
    return help(EXIT.BADARGS)
  }

  /* TODO: Remove all data of previous machines? */
  //fs.rmSync(fake_data_dir, { recursive: true, force: true })

  /* Create the root data directory */
  fs.mkdirSync(fake_data_dir, { recursive: true, mode: 0o750 })

  const gencerts_path = path.join(machine, "tools", "generate-certificates")
  let exit_code = EXIT.OK
  for (let i = 0; i < n && exit_code === EXIT.OK; i++)
    exit_code = await create_fake_machine(gencerts_path, fake_data_dir, i)

  return exit_code
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
