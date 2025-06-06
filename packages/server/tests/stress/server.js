const { fork } = require('node:child_process')
const { join } = require('node:path')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = 'Start the server configured for stress testing.'

const cli = CLI({
  grammar: [[['--help'], 'Show this help message']],
})

const help = exit_code => {
  console.log('Usage: lamassu-server-stress-testing server ARGS...')
  console.log(help_message)
  cli.help()
  return exit_code
}

const start_server = args =>
  new Promise(resolve => {
    const lamassu_server = join(__dirname, '../../bin/lamassu-server')
    const ls = fork(lamassu_server, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { LAMASSU_STRESS_TESTING: 'YES' },
    })

    ls.on('error', error => {
      console.log(error)
      resolve(EXIT.EXCEPTION)
    })

    ls.on('exit', (code, signal) => {
      console.error('lamassu-server code:', code)
      console.error('lamassu-server signal:', signal)
      resolve(typeof code === 'number' ? code : EXIT.EXCEPTION)
    })
  })

const run = async args => {
  const [err, options, positional] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help) return help(EXIT.OK)

  return await start_server(positional)
}

module.exports = {
  help_message,
  run,
}
