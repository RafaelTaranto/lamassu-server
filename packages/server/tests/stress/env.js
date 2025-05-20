const { readFileSync, writeFileSync } = require('node:fs')
const { EOL } = require('node:os')
const { resolve } = require('node:path')

const dotenv = require('dotenv')

const { EXIT } = require('./consts')
const CLI = require('./cli')

const help_message = 'Produce an .env file appropriate for stress testing.'

const cli = CLI({
  grammar: [
    [['--help'], 'Show this help message'],
    [['--inenv', 'ENV'], 'Environment file path to read', '.env'],
    [['--outenv', 'ENV'], 'Environment file path to write', '.stress.env'],
    [['--dbuser', 'DBUSER'], 'Database username', 'postgres'],
    [['--dbpass', 'DBPASS'], 'Database password', 'postgres123'],
    [['--dbhost', 'DBHOST'], 'Database hostname', 'localhost'],
    [['--dbport', 'DBPORT'], 'Database port', '5432'],
    [['--dbname', 'DBNAME'], 'Database name', 'lamassu_stress'],
  ],
})

const help = exit_code => {
  console.log('Usage: lamassu-server-stress-testing env ARGS...')
  console.log(help_message)
  cli.help()
  return exit_code
}

const env_read = path => {
  const envstr = readFileSync(path, { encoding: 'utf8' })
  return dotenv.parse(envstr)
  //const entries = envstr
  //  .split(EOL)
  //  .flatMap((line) => {
  //    line = line.trimStart()
  //    const i = line.indexOf('=')
  //
  //    if (line.startsWith('#') || i <= 0)
  //      return []
  //
  //    const varname = line.substring(0, i)
  //    const value = line.substring(i + 1)
  //    return [[varname, value]]
  //  })
  //return Object.fromEntries(entries)
}

const env_write = (envvars, path) => {
  const envcontent =
    Object.entries(envvars)
      .map(([varname, value]) => [varname, value].join('='))
      .join(EOL) + EOL
  writeFileSync(path, envcontent)
}

const run = async args => {
  const [err, options, positional] = cli.parse(args)
  if (err) {
    console.error(err)
    return help(EXIT.BADARGS)
  }

  if (options.help) return help(EXIT.OK)

  if (positional.length > 0) {
    console.error('Unknown arguments:', positional)
    return help(EXIT.BADARGS)
  }

  const inenvpath = resolve(process.cwd(), options.inenv ?? '.env')
  const inenvvars = env_read(inenvpath)

  const outenvpath = resolve(process.cwd(), options.outenv ?? '.stress.env')
  const outenvvars = {
    ...inenvvars,
    POSTGRES_USER: options.dbuser ?? 'postgres',
    POSTGRES_PASSWORD: options.dbpass ?? 'postgres123',
    POSTGRES_HOST: options.dbhost ?? 'localhost',
    POSTGRES_PORT: options.dbport ?? '5432',
    POSTGRES_DB: options.dbname ?? 'lamassu_stress',
  }
  env_write(outenvvars, outenvpath)

  return EXIT.OK
}

module.exports = {
  help_message,
  run,
}
