import { sql } from 'kysely'
import db from './db.js'
import type {
  CashInWithBatchEB,
  CashOutEB,
  CustomerWithEditedDataEB,
  DevicesAndUnpairedDevicesEB,
} from './types/manual.types.js'
import { selectNewestIdCardData } from './customers.js'

const PENDING_INTERVAL = '60 minutes'
const REDEEMABLE_INTERVAL = '24 hours'

function getDeviceName(eb: DevicesAndUnpairedDevicesEB) {
  return eb
    .case()
    .when(eb('ud.name', 'is not', null))
    .then(eb('ud.name', '||', ' (unpaired)'))
    .when(eb('d.name', 'is not', null))
    .then(eb.ref('d.name'))
    .else('Unpaired')
    .end()
}

function customerData({ eb, ref }: CustomerWithEditedDataEB) {
  return [
    ref('cst.phone').as('customerPhone'),
    ref('cst.email').as('customerEmail'),
    selectNewestIdCardData(eb).as('customerIdCardData'),
    ref('cst.frontCameraPath').as('customerFrontCameraPath'),
    ref('cst.idCardPhotoPath').as('customerIdCardPhotoPath'),
    ref('cst.isTestCustomer').as('isTestCustomer'),
  ]
}

function isCashInExpired(eb: CashInWithBatchEB) {
  return eb.and([
    eb.not('txIn.sendConfirmed'),
    eb(
      'txIn.created',
      '<=',
      sql<Date>`now() - interval '${sql.raw(PENDING_INTERVAL)}'`,
    ),
  ])
}

function isCashOutExpired(eb: CashOutEB) {
  return eb.and([
    eb.not('txOut.dispense'),
    eb(
      eb.fn.coalesce('txOut.confirmed_at', 'txOut.created'),
      '<=',
      sql<Date>`now() - interval '${sql.raw(REDEEMABLE_INTERVAL)}'`,
    ),
  ])
}

function cashOutTransactionStates(eb: CashOutEB) {
  return eb
    .case()
    .when(eb('txOut.error', '=', eb.val('Operator cancel')))
    .then('Cancelled')
    .when(eb('txOut.error', 'is not', null))
    .then('Error')
    .when(eb.ref('txOut.dispense'))
    .then('Success')
    .when(isCashOutExpired(eb))
    .then('Expired')
    .else('Pending')
    .end()
}

function cashInTransactionStates(eb: CashInWithBatchEB) {
  const operatorCancel = eb.and([
    eb.ref('txIn.operatorCompleted'),
    eb('txIn.error', '=', eb.val('Operator cancel')),
  ])

  const hasError = eb.or([
    eb('txIn.error', 'is not', null),
    eb('txInB.errorMessage', 'is not', null),
  ])

  return eb
    .case()
    .when(operatorCancel)
    .then('Cancelled')
    .when(hasError)
    .then('Error')
    .when(eb.ref('txIn.sendConfirmed'))
    .then('Sent')
    .when(isCashInExpired(eb))
    .then('Expired')
    .else('Pending')
    .end()
}

function getCashOutTransactionList() {
  return db
    .selectFrom('cashOutTxs as txOut')
    .leftJoin('customers as cst', 'cst.id', 'txOut.customerId')
    .leftJoin('editedCustomerData as cstED', 'cst.id', 'cstED.customerId')
    .innerJoin('cashOutActions as txOutActions', join =>
      join
        .onRef('txOut.id', '=', 'txOutActions.txId')
        .on('txOutActions.action', '=', 'provisionAddress'),
    )
    .leftJoin('devices as d', 'd.deviceId', 'txOut.deviceId')
    .leftJoin('unpairedDevices as ud', join =>
      join
        .onRef('txOut.deviceId', '=', 'ud.deviceId')
        .on('ud.unpaired', '>=', eb => eb.ref('txOut.created'))
        .on('txOut.created', '>=', eb => eb.ref('ud.paired')),
    )
    .select(({ eb, val }) => [
      'txOut.id',
      val('cashOut').as('txClass'),
      'txOut.deviceId',
      'txOut.toAddress',
      'txOut.cryptoAtoms',
      'txOut.cryptoCode',
      'txOut.fiat',
      'txOut.fiatCode',
      'txOut.phone', // TODO why does this has phone? Why not get from customer?
      'txOut.error',
      'txOut.created',
      'txOut.timedout',
      'txOut.errorCode',
      'txOut.fixedFee',
      'txOut.txVersion',
      'txOut.termsAccepted',
      'txOut.commissionPercentage',
      'txOut.rawTickerPrice',
      isCashOutExpired(eb).as('expired'),
      getDeviceName(eb).as('machineName'),
      'txOut.discount',
      cashOutTransactionStates(eb).as('status'),
      'txOut.customerId',
      ...customerData(eb),
      'txOut.txCustomerPhotoPath',
      'txOut.txCustomerPhotoAt',
      'txOut.walletScore',
      // cash-in only
      val(null).as('fee'),
      val(null).as('txHash'),
      val(false).as('send'),
      val(false).as('sendConfirmed'),
      val(null).as('sendTime'),
      val(false).as('operatorCompleted'),
      val(false).as('sendPending'),
      val(0).as('minimumTx'),
      val(null).as('isPaperWallet'),
      val(false).as('batched'),
      val(null).as('batchTime'),
      val(null).as('batchError'),
      // cash-out only
      'txOut.dispense',
      'txOut.swept',
    ])
}

function getCashInTransactionList() {
  return db
    .selectFrom('cashInTxs as txIn')
    .leftJoin('customers as cst', 'cst.id', 'txIn.customerId')
    .leftJoin('editedCustomerData as cstED', 'cst.id', 'cstED.customerId')
    .leftJoin('transactionBatches as txInB', 'txInB.id', 'txIn.batchId')
    .leftJoin('devices as d', 'd.deviceId', 'txIn.deviceId')
    .leftJoin('unpairedDevices as ud', join =>
      join
        .onRef('txIn.deviceId', '=', 'ud.deviceId')
        .on('ud.unpaired', '>=', eb => eb.ref('txIn.created'))
        .on('txIn.created', '>=', eb => eb.ref('ud.paired')),
    )
    .select(({ eb, val }) => [
      'txIn.id',
      val('cashIn').as('txClass'),
      'txIn.deviceId',
      'txIn.toAddress',
      'txIn.cryptoAtoms',
      'txIn.cryptoCode',
      'txIn.fiat',
      'txIn.fiatCode',
      'txIn.phone', // TODO why does this has phone? Why not get from customer?
      'txIn.error',
      'txIn.created',
      'txIn.timedout',
      'txIn.errorCode',
      'txIn.cashInFee as fixedFee',
      'txIn.txVersion',
      'txIn.termsAccepted',
      'txIn.commissionPercentage',
      'txIn.rawTickerPrice',
      isCashInExpired(eb).as('expired'),
      getDeviceName(eb).as('machineName'),
      'txIn.discount',
      cashInTransactionStates(eb).as('status'),
      'txIn.customerId',
      ...customerData(eb),
      'txIn.txCustomerPhotoPath',
      'txIn.txCustomerPhotoAt',
      'txIn.walletScore',
      // cash-in only
      'txIn.fee',
      'txIn.txHash',
      'txIn.send',
      'txIn.sendConfirmed',
      'txIn.sendTime',
      'txIn.operatorCompleted',
      'txIn.sendPending',
      'txIn.minimumTx',
      'txIn.isPaperWallet',
      'txInB.errorMessage as batchError',
      'txIn.batched',
      'txIn.batchTime',
      // cash-out only
      val(false).as('dispense'),
      val(false).as('swept'),
    ])
}

interface PaginationParams {
  limit?: number
  offset?: number
}

interface FilterParams {
  from?: Date
  until?: Date
  toAddress?: string
  txClass?: string
  deviceId?: string
  customerId?: string
  cryptoCode?: string
  swept?: boolean
  status?: string
  excludeTestingCustomers?: boolean
}

async function getTransactionList(
  filters: FilterParams,
  pagination?: PaginationParams,
) {
  let query = db
    .selectFrom(() =>
      getCashInTransactionList()
        .unionAll(getCashOutTransactionList())
        .as('transactions'),
    )
    .selectAll('transactions')
    .select(eb =>
      sql<{
        totalCount: number
      }>`json_build_object(${sql.lit('totalCount')}, ${eb.fn.count('transactions.id').over()})`.as(
        'paginationStats',
      ),
    )
    .orderBy('transactions.created', 'desc')

  if (filters.toAddress) {
    query = query.where(
      'transactions.toAddress',
      'like',
      `%${filters.toAddress}%`,
    )
  }

  if (filters.from) {
    query = query.where('transactions.created', '>=', filters.from)
  }

  if (filters.until) {
    query = query.where('transactions.created', '<=', filters.until)
  }

  if (filters.deviceId) {
    query = query.where('transactions.deviceId', '=', filters.deviceId)
  }

  if (filters.txClass) {
    query = query.where('transactions.txClass', '=', filters.txClass)
  }

  if (filters.customerId) {
    query = query.where('transactions.customerId', '=', filters.customerId)
  }

  if (filters.cryptoCode) {
    query = query.where('transactions.cryptoCode', '=', filters.cryptoCode)
  }

  if (filters.swept) {
    query = query.where('transactions.swept', '=', filters.swept)
  }

  if (filters.status) {
    query = query.where('transactions.status', '=', filters.status)
  }

  if (filters.excludeTestingCustomers) {
    query = query.where('transactions.isTestCustomer', '=', false)
  }

  if (pagination?.limit) {
    query = query.limit(pagination.limit)
  }

  if (pagination?.offset) {
    query = query.offset(pagination.offset)
  }

  return query.execute()
}

export {
  getTransactionList,
  getCashInTransactionList,
  getCashOutTransactionList,
}
