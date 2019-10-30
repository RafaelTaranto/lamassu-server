const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const http = require('http')
const got = require('got')
const xmlrpc = require('xmlrpc')

const supportLogs = require('../support_logs')
const machineLoader = require('../machine-loader')
const logs = require('../logs')

const funding = require('./funding')
const config = require('./config')

const devMode = require('minimist')(process.argv.slice(2)).dev

const app = express()
app.use(bodyParser.json())

if (devMode) {
  app.use(cors())
}

app.get('/api/config', async (req, res, next) => {
  const state = config.getConfig(req.params.config)
  const data = await config.fetchData()
  res.json({ state, data })
  next()
})

app.post('/api/config', (req, res, next) => {
  config.saveConfig(req.body)
    .then(it => res.json(it))
    .then(() => dbNotify())
    .catch(next)
})

app.get('/api/funding', (req, res) => {
  return funding.getFunding()
    .then(r => res.json(r))
})

app.get('/api/machines', (req, res) => {
  machineLoader.getMachineNames()
    .then(r => res.send({ machines: r }))
})

app.get('/api/logs/:deviceId', (req, res, next) => {
  return logs.getMachineLogs(req.params.deviceId)
    .then(r => res.send(r))
    .catch(next)
})

app.post('/api/support_logs', (req, res, next) => {
  return supportLogs.insert(req.query.deviceId)
    .then(r => res.send(r))
    .catch(next)
})

app.get('/api/version', (req, res, next) => {
  res.send(require('../../package.json').version)
})

// TODO: get URL from config file somewhere
app.get('/api/uptimes', (req, res, next) => {
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
    res.send(
      value.map(process => {
        return {
          name: process.name,
          state: convertStates(process.statename),
          uptime: (process.statename === 'RUNNING') ? new Date(process.now) - new Date(process.start) : 0
        }
      })
    )
  })
})

function dbNotify () {
  return got.post('http://localhost:3030/dbChange')
    .catch(e => console.error('Error: lamassu-server not responding'))
}

function run () {
  const serverPort = 8070

  const serverLog = `lamassu-admin-server listening on port ${serverPort}`

  const webServer = http.createServer(app)
  webServer.listen(serverPort, () => console.log(serverLog))
}

module.exports = { run }
