const minimist = require('minimist')

const { EXIT } = require('./consts')

const SUBCMDS = {
  env: require('./env'),
  db: require('./db'),
  machines: require('./machines'),
  server: require('./server'),
}

const README = `
This program will help you set the lamassu-server up for stress testing. This
short introduction is meant only as a quickstart guide; the subcommands may
support more options beyond those shown here. Use the --help flag for details
on each subcommand.

First of all, you need to create a suitable .env file. With the following
commands, .env.bak will be used as a starting point, and the result will be
saved in .env. This helps to avoid losing the real configurations.

$ cp .env .env.bak
$ lamassu-server-stress-testing env --inenv .env.bak --outenv .env

The database chosen in the command above (by default 'lamassu_stress') must be
initialized, and must have a bare-bones configuration. The following command
takes care of it:

$ lamassu-server-stress-testing db

You also need to create fake machines that will be used later in the actual
stress tests (including certificates, and pairing each to the server). The
following command creates 10 fake machines, and saves their data in
path/to/stress/data/. path/to/real/machine/code/ is the path to the root of the
machine's code.

$ lamassu-server-stress-testing machines -n 10 --fake_data_dir path/to/stress/data/ --machine path/to/real/machine/code/ --replace_existing

Finally, use the following to start the lamassu-server in stress-testing mode:

$ lamassu-server-stress-testing server
`;

const rightpad = (s, w, c) => s + c.repeat(Math.max(w-s.length, 0))

const help = (exit_code) => {
  console.log("Usage: lamassu-server-stress-testing SUBCMD ARGS...")
  console.log("Where SUBCMD is one of the following:")
  const max_subcmd_length = Math.max(...Object.keys(SUBCMDS).map(subcmd => subcmd.length))
  Object.entries(SUBCMDS).forEach(
    ([subcmd, { help_message }]) => {
      console.log(`\t${rightpad(subcmd, max_subcmd_length, ' ')}\t${help_message ?? ''}`)
    }
  )

  console.log(README)

  return exit_code
}

const main = async (args) => {
  try {
    const subcmd = SUBCMDS[args[0]]

    const exit_code = (args.length === 0) ? help(EXIT.OK) :
      (!subcmd) ? help(EXIT.BADARGS) :
      await subcmd.run(args.slice(1))

    process.exit(exit_code ?? EXIT.UNKNOWN)
  } catch (err) {
    console.error(err)
    process.exit(EXIT.EXCEPTION)
  }
}

module.exports = main
