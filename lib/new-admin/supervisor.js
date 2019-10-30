const xmlrpc = require('xmlrpc')

function getAllProcessInfo () {
  const convertStates = (state) => {
    switch (state) {
      case 'EXITED':
        return 'STOPPED'
      case 'STOPPING':
        return 'STOPPED'
      case 'STARTING':
        return 'RUNNING'
      case 'BACKOFF':
        return 'FATAL'
      default:
        return state
    }
  }

  xmlrpc.createClient({
    host: 'localhost',
    port: '9001',
    path: '/RPC2'
  }).methodCall('supervisor.getAllProcessInfo', [], function (error, value) {
    if (error) console.log(error) // TODO: properly log error
    return value.map(process => {
      return {
        name: process.name,
        state: convertStates(process.statename),
        uptime: (process.statename === 'RUNNING') ? new Date(process.now) - new Date(process.start) : 0
      }
    })
  })
}

module.exports = { getAllProcessInfo }
