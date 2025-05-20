const crypto = require('crypto')
const os = require('os')
const path = require('path')
const cp = require('child_process')
const fs = require('fs')
const makeDir = require('make-dir')

const _ = require('lodash/fp')

const logger = require('console-log-level')({ level: 'info' })

const { isDevMode } = require('../environment-helper')

const BLOCKCHAIN_DIR = process.env.BLOCKCHAIN_DIR

module.exports = {
  es,
  writeSupervisorConfig,
  firewall,
  randomPass,
  fetchAndInstall,
  logger,
  isInstalledSoftware,
  writeFile,
  getBinaries,
  isUpdateDependent,
}

const BINARIES = {
  BTC: {
    defaultUrl:
      'https://bitcoincore.org/bin/bitcoin-core-0.20.1/bitcoin-0.20.1-x86_64-linux-gnu.tar.gz',
    defaultUrlHash:
      '376194f06596ecfa40331167c39bc70c355f960280bd2a645fdbf18f66527397',
    defaultDir: 'bitcoin-0.20.1/bin',
    url: 'https://bitcoincore.org/bin/bitcoin-core-29.0/bitcoin-29.0-x86_64-linux-gnu.tar.gz',
    dir: 'bitcoin-29.0/bin',
    urlHash: 'a681e4f6ce524c338a105f214613605bac6c33d58c31dc5135bbc02bc458bb6c',
  },
  ETH: {
    url: 'https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.15.11-36b2371c.tar.gz',
    dir: 'geth-linux-amd64-1.15.11-36b2371c',
    urlHash: 'a14a4285daedf75ea04a7a298e6caa48d566a2786c93fc5e86ec2c5998c92455',
  },
  ZEC: {
    url: 'https://download.z.cash/downloads/zcash-6.2.0-linux64-debian-bullseye.tar.gz',
    dir: 'zcash-6.2.0/bin',
    urlHash: '71cf378c27582a4b9f9d57cafc2b5a57a46e9e52a5eda33be112dc9790c64c6f',
  },
  DASH: {
    defaultUrl:
      'https://github.com/dashpay/dash/releases/download/v18.1.0/dashcore-18.1.0-x86_64-linux-gnu.tar.gz',
    defaultUrlHash:
      'd89c2afd78183f3ee815adcccdff02098be0c982633889e7b1e9c9656fbef219',
    defaultDir: 'dashcore-18.1.0/bin',
    url: 'https://github.com/dashpay/dash/releases/download/v22.1.2/dashcore-22.1.2-x86_64-linux-gnu.tar.gz',
    dir: 'dashcore-22.1.2/bin',
    urlHash: '230e871ef55c64c1550f358089a324a1e47e52a9a9c032366162cd82a19fa1af',
  },
  LTC: {
    defaultUrl:
      'https://download.litecoin.org/litecoin-0.18.1/linux/litecoin-0.18.1-x86_64-linux-gnu.tar.gz',
    defaultUrlHash:
      'ca50936299e2c5a66b954c266dcaaeef9e91b2f5307069b9894048acf3eb5751',
    defaultDir: 'litecoin-0.18.1/bin',
    url: 'https://download.litecoin.org/litecoin-0.21.4/linux/litecoin-0.21.4-x86_64-linux-gnu.tar.gz',
    dir: 'litecoin-0.21.4/bin',
    urlHash: '857fc41091f2bae65c3bf0fd4d388fca915fc93a03f16dd2578ac3cc92898390',
  },
  BCH: {
    url: 'https://github.com/bitcoin-cash-node/bitcoin-cash-node/releases/download/v28.0.1/bitcoin-cash-node-28.0.1-x86_64-linux-gnu.tar.gz',
    dir: 'bitcoin-cash-node-28.0.1/bin',
    files: [
      ['bitcoind', 'bitcoincashd'],
      ['bitcoin-cli', 'bitcoincash-cli'],
    ],
    urlHash: 'd69ee632147f886ca540cecdff5b1b85512612b4c005e86b09083a63c35b64fa',
  },
  XMR: {
    url: 'https://downloads.getmonero.org/cli/monero-linux-x64-v0.18.4.0.tar.bz2',
    dir: 'monero-x86_64-linux-gnu-v0.18.4.0',
    files: [
      ['monerod', 'monerod'],
      ['monero-wallet-rpc', 'monero-wallet-rpc'],
    ],
    urlHash: '16cb74c899922887827845a41d37c7f3121462792a540843f2fcabcc1603993f',
  },
}

const coinsUpdateDependent = ['BTC', 'LTC', 'DASH']

function firewall(ports) {
  if (!ports || ports.length === 0) throw new Error('No ports supplied')
  const portsString = ports.join(',')
  es(`sudo ufw allow ${portsString}`)
}

function randomPass() {
  return crypto.randomBytes(32).toString('hex')
}

function es(cmd) {
  const env = { HOME: os.userInfo().homedir }
  const options = { encoding: 'utf8', env }
  const res = cp.execSync(cmd, options)
  logger.debug(res)
  return res.toString()
}

function generateSupervisorConfig(cryptoCode, command, isWallet = false) {
  return `[program:${cryptoCode}${isWallet ? `-wallet` : ``}]
command=nice ${command}
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/${cryptoCode}${isWallet ? `-wallet` : ``}.err.log
stdout_logfile=/var/log/supervisor/${cryptoCode}${isWallet ? `-wallet` : ``}.out.log
stderr_logfile_backups=2
stdout_logfile_backups=2
environment=HOME="/root"
`
}

function writeSupervisorConfig(coinRec, cmd, walletCmd = '') {
  if (isInstalledSoftware(coinRec)) return

  const blockchain = coinRec.code

  if (!_.isNil(coinRec.wallet)) {
    const supervisorConfigWallet = generateSupervisorConfig(
      blockchain,
      walletCmd,
      true,
    )
    writeFile(
      `/etc/supervisor/conf.d/${coinRec.code}-wallet.conf`,
      supervisorConfigWallet,
    )
  }

  const supervisorConfig = generateSupervisorConfig(blockchain, cmd)
  writeFile(`/etc/supervisor/conf.d/${coinRec.code}.conf`, supervisorConfig)
}

function isInstalledSoftware(coinRec) {
  if (isDevMode()) {
    return (
      fs.existsSync(
        `${BLOCKCHAIN_DIR}/${coinRec.code}/${coinRec.configFile}`,
      ) && fs.existsSync(`${BLOCKCHAIN_DIR}/bin/${coinRec.daemon}`)
    )
  }

  const nodeInstalled = fs.existsSync(
    `/etc/supervisor/conf.d/${coinRec.code}.conf`,
  )
  const walletInstalled = _.isNil(coinRec.wallet)
    ? true
    : fs.existsSync(`/etc/supervisor/conf.d/${coinRec.code}.wallet.conf`)
  return nodeInstalled && walletInstalled
}

function fetchAndInstall(coinRec) {
  const requiresUpdate = isUpdateDependent(coinRec.cryptoCode)
  if (isInstalledSoftware(coinRec)) return

  const binaries = BINARIES[coinRec.cryptoCode]
  if (!binaries) throw new Error(`No such coin: ${coinRec.code}`)

  const url = requiresUpdate ? binaries.defaultUrl : binaries.url
  const hash = requiresUpdate ? binaries.defaultUrlHash : binaries.urlHash
  const downloadFile = path.basename(url)
  const binDir = requiresUpdate ? binaries.defaultDir : binaries.dir

  es(`wget -q ${url}`)
  if (es(`sha256sum ${downloadFile} | awk '{print $1}'`).trim() !== hash) {
    logger.info(
      `Failed to install ${coinRec.code}: Package signature do not match!`,
    )
    return
  }
  es(`tar -xf ${downloadFile}`)

  const usrBinDir = isDevMode()
    ? path.resolve(BLOCKCHAIN_DIR, 'bin')
    : '/usr/local/bin'

  if (isDevMode()) {
    makeDir.sync(usrBinDir)
  }

  if (_.isEmpty(binaries.files)) {
    es(`sudo cp ${binDir}/* ${usrBinDir}`)
    return
  }

  _.forEach(([source, target]) => {
    es(`sudo cp ${binDir}/${source} ${usrBinDir}/${target}`)
  }, binaries.files)
}

function writeFile(path, content) {
  try {
    fs.writeFileSync(path, content)
  } catch (err) {
    if (err.code === 'EEXIST') {
      logger.info(`${path} exists, skipping.`)
      return
    }

    throw err
  }
}

function getBinaries(coinCode) {
  const binaries = BINARIES[coinCode]
  if (!binaries) throw new Error(`No such coin: ${coinCode}`)
  return binaries
}

function isUpdateDependent(coinCode) {
  return _.includes(coinCode, coinsUpdateDependent)
}
