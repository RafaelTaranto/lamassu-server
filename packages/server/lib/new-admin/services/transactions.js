const _ = require('lodash/fp')

const db = require('../../db')
const BN = require('../../bn')
const { utils: coinUtils } = require('@lamassu/coins')
const cashInTx = require('../../cash-in/cash-in-tx')
const { REDEEMABLE_AGE } = require('../../cash-out/cash-out-helper')
const {
  transactions: { getTransactionList },
} = require('typesafe-db')

function addProfits(txs) {
  return _.map(
    it => ({
      ...it,
      profit: getProfit(it).toString(),
      cryptoAmount: getCryptoAmount(it).toString(),
    }),
    txs,
  )
}

function batch({
  from = new Date(0).toISOString(),
  until = new Date().toISOString(),
  limit = null,
  offset = 0,
  txClass = null,
  deviceId = null,
  customerId = null,
  cryptoCode = null,
  toAddress = null,
  status = null,
  swept = null,
  excludeTestingCustomers = false,
  simplified,
}) {
  const isCsvExport = _.isBoolean(simplified)
  return getTransactionList(
    {
      from,
      until,
      cryptoCode,
      txClass,
      deviceId,
      toAddress,
      customerId,
      swept,
      status,
      excludeTestingCustomers,
    },
    { limit, offset },
  )
    .then(addProfits)
    .then(res =>
      !isCsvExport
        ? res
        : // GQL transactions and transactionsCsv both use this function and
          // if we don't check for the correct simplified value, the Transactions page polling
          // will continuously build a csv in the background
          simplified
          ? simplifiedBatch(res)
          : advancedBatch(res),
    )
}

function advancedBatch(data) {
  const fields = [
    'txClass',
    'id',
    'deviceId',
    'toAddress',
    'cryptoAtoms',
    'cryptoCode',
    'fiat',
    'fiatCode',
    'fee',
    'status',
    'profit',
    'cryptoAmount',
    'dispense',
    'notified',
    'redeem',
    'phone',
    'email',
    'error',
    'fixedFee',
    'created',
    'confirmedAt',
    'hdIndex',
    'swept',
    'timedout',
    'dispenseConfirmed',
    'provisioned1',
    'provisioned2',
    'provisioned3',
    'provisioned4',
    'provisionedRecycler1',
    'provisionedRecycler2',
    'provisionedRecycler3',
    'provisionedRecycler4',
    'provisionedRecycler5',
    'provisionedRecycler6',
    'denomination1',
    'denomination2',
    'denomination3',
    'denomination4',
    'denominationRecycler1',
    'denominationRecycler2',
    'denominationRecycler3',
    'denominationRecycler4',
    'denominationRecycler5',
    'denominationRecycler6',
    'errorCode',
    'customerId',
    'txVersion',
    'publishedAt',
    'termsAccepted',
    'commissionPercentage',
    'rawTickerPrice',
    'receivedCryptoAtoms',
    'discount',
    'txHash',
    'customerPhone',
    'customerEmail',
    'customerIdCardDataNumber',
    'customerIdCardDataExpiration',
    'customerIdCardData',
    'sendTime',
    'customerFrontCameraPath',
    'customerIdCardPhotoPath',
    'expired',
    'machineName',
    'walletScore',
  ]

  const addAdvancedFields = _.map(it => ({
    ...it,
    fixedFee: it.fixedFee ?? null,
    fee: it.fee ?? null,
  }))

  return _.compose(_.map(_.pick(fields)), addAdvancedFields)(data)
}

function simplifiedBatch(data) {
  const fields = [
    'txClass',
    'id',
    'created',
    'machineName',
    'fee',
    'cryptoCode',
    'cryptoAtoms',
    'fiat',
    'fiatCode',
    'phone',
    'email',
    'toAddress',
    'txHash',
    'dispense',
    'error',
    'status',
    'profit',
    'cryptoAmount',
  ]

  return _.map(_.pick(fields))(data)
}

const getCryptoAmount = it =>
  coinUtils.toUnit(BN(it.cryptoAtoms), it.cryptoCode)

const getProfit = it => {
  /* fiat - crypto*tickerPrice */
  const calcCashInProfit = (fiat, crypto, tickerPrice) =>
    fiat.minus(crypto.times(tickerPrice))
  /* crypto*tickerPrice - fiat */
  const calcCashOutProfit = (fiat, crypto, tickerPrice) =>
    crypto.times(tickerPrice).minus(fiat)

  const fiat = BN(it.fiat)
  const crypto = getCryptoAmount(it)
  const tickerPrice = BN(it.rawTickerPrice)
  const isCashIn = it.txClass === 'cashIn'

  return isCashIn
    ? calcCashInProfit(fiat, crypto, tickerPrice)
    : calcCashOutProfit(fiat, crypto, tickerPrice)
}

function getTx(txId, txClass) {
  const cashInSql = `select 'cashIn' as tx_class, txs.*,
  ((not txs.send_confirmed) and (txs.created <= now() - interval $1)) as expired
  from cash_in_txs as txs
  where txs.id=$2`

  const cashOutSql = `select 'cashOut' as tx_class,
  txs.*,
  (extract(epoch from (now() - greatest(txs.created, txs.confirmed_at))) * 1000) >= $2 as expired
  from cash_out_txs txs
  where txs.id=$1`

  return txClass === 'cashIn'
    ? db.oneOrNone(cashInSql, [cashInTx.PENDING_INTERVAL, txId])
    : db.oneOrNone(cashOutSql, [txId, REDEEMABLE_AGE])
}

function getTxAssociatedData(txId, txClass) {
  const billsSql = `select 'bills' as bills, b.* from bills b where cash_in_txs_id = $1`
  const actionsSql = `select 'cash_out_actions' as cash_out_actions, actions.* from cash_out_actions actions where tx_id = $1`

  return txClass === 'cashIn'
    ? db.manyOrNone(billsSql, [txId])
    : db.manyOrNone(actionsSql, [txId])
}

function updateTxCustomerPhoto(customerId, txId, direction, data) {
  const formattedData = _.mapKeys(_.snakeCase, data)
  const cashInSql =
    'UPDATE cash_in_txs SET tx_customer_photo_at = $1, tx_customer_photo_path = $2 WHERE customer_id=$3 AND id=$4'

  const cashOutSql =
    'UPDATE cash_out_txs SET tx_customer_photo_at = $1, tx_customer_photo_path = $2 WHERE customer_id=$3 AND id=$4'

  return direction === 'cashIn'
    ? db.oneOrNone(cashInSql, [
        formattedData.tx_customer_photo_at,
        formattedData.tx_customer_photo_path,
        customerId,
        txId,
      ])
    : db.oneOrNone(cashOutSql, [
        formattedData.tx_customer_photo_at,
        formattedData.tx_customer_photo_path,
        customerId,
        txId,
      ])
}

module.exports = {
  batch,
  getTx,
  getTxAssociatedData,
  updateTxCustomerPhoto,
}
