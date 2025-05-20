const trimStart = (s, c) => {
  let idx = 0
  while (idx < s.length && s[idx] === c) idx++
  return idx > 0 ? s.substring(idx) : s
}

const optkey = opt => trimStart(opt, '-')

const parse = (default_options, option_arities) => args => {
  const positional = []
  const parsed_options = {}

  for (let i = 0; i < args.length; ) {
    const arg = args[i]
    i++

    const arity = option_arities[arg]
    if (typeof arity === 'number') {
      if (arity + i > args.length)
        return [`${arg}: not enough arguments.`, parsed_options, positional]

      const opt = optkey(arg)
      switch (arity) {
        case 0:
          parsed_options[opt] = true
          break
        case 1:
          parsed_options[opt] = args[i]
          break
        default:
          parsed_options[opt] = args.slice(i, i + arity)
          break
      }
      i += arity
    } else {
      positional.push(arg)
    }
  }

  const options = Object.assign({}, default_options, parsed_options)
  return [null, options, positional]
}

const help =
  ({ grammar, usage }) =>
  () => {
    if (usage) console.log(usage)
    grammar.forEach(([optargs, optdesc, def]) => {
      const deftext = def ? ` (default: ${def})` : ''
      console.log(`\t${optargs.join(' ')}\t${optdesc}${deftext}`)
    })
  }

const CLI = ({ grammar, usage }) => {
  const details = grammar.map(([[opt, ...optargs], , def]) => [
    opt,
    optargs.length,
    def,
  ])
  const option_arities = Object.fromEntries(
    details.map(([opt, arity]) => [opt, arity]),
  )
  const default_options = Object.fromEntries(
    details.map(([opt, , def]) => [optkey(opt), def]),
  )
  return {
    parse: parse(default_options, option_arities),
    help: help({ grammar, usage }),
  }
}

module.exports = CLI
