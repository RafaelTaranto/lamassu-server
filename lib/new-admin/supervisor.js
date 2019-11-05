const xmlrpc = require('xmlrpc')
const logger = require('../logger')
const { promisify } = require('util')

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

  const client = xmlrpc.createClient({
    host: 'localhost',
    port: '9001',
    path: '/RPC2'
  })

  client.methodCall[promisify.custom] = (method, params) => {
    return new Promise((resolve, reject) => client.methodCall(method, params, (err, value) => {
      if (err) reject(err)
      else resolve(value)
    }))
  }

  return promisify(client.methodCall)('supervisor.getAllProcessInfo', [])
    .then((value) => {
      return value.map(process => (
        {
          name: process.name,
          state: convertStates(process.statename),
          uptime: (process.statename === 'RUNNING') ? new Date(process.now) - new Date(process.start) : 0
        }
      ))
    })
    .catch((error) => {
      if (error.code === 'ECONNREFUSED') logger.error('Failed to connect to supervisord HTTP server.')
      else logger.error(error)
    })
}

module.exports = { getAllProcessInfo }
