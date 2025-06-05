import { sql } from 'kysely'
import db from './db.js'
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import type {
  CustomerEB,
  CustomerWithEditedDataEB,
} from './types/manual.types.js'

const ANON_ID = '47ac1184-8102-11e7-9079-8f13a7117867'
const TX_PASSTHROUGH_ERROR_CODES = [
  'operatorCancel',
  'scoreThresholdReached',
  'walletScoringError',
]

function transactionUnion(eb: CustomerEB) {
  return eb
    .selectFrom('cashInTxs')
    .select([
      'created',
      'fiat',
      'fiatCode',
      'errorCode',
      eb.val('cashIn').as('txClass'),
    ])
    .where(({ eb, and, or, ref }) =>
      and([
        eb('customerId', '=', ref('cst.id')),
        or([eb('sendConfirmed', '=', true), eb('batched', '=', true)]),
      ]),
    )
    .unionAll(
      eb
        .selectFrom('cashOutTxs')
        .select([
          'created',
          'fiat',
          'fiatCode',
          'errorCode',
          eb.val('cashOut').as('txClass'),
        ])
        .where(({ eb, and, ref }) =>
          and([
            eb('customerId', '=', ref('cst.id')),
            eb('confirmedAt', 'is not', null),
          ]),
        ),
    )
}

function joinLatestTx(eb: CustomerEB) {
  return eb
    .selectFrom(eb =>
      transactionUnion(eb).orderBy('created', 'desc').limit(1).as('lastTx'),
    )
    .select(['fiatCode', 'fiat', 'txClass', 'created'])
    .as('lastTx')
}

function joinTxsTotals(eb: CustomerEB) {
  return eb
    .selectFrom(eb => transactionUnion(eb).as('combinedTxs'))
    .select([
      eb => eb.fn.coalesce(eb.fn.countAll(), eb.val(0)).as('totalTxs'),
      eb =>
        eb.fn
          .coalesce(
            eb.fn.sum(
              eb
                .case()
                .when(
                  eb.or([
                    eb('combinedTxs.errorCode', 'is', null),
                    eb(
                      'combinedTxs.errorCode',
                      'not in',
                      TX_PASSTHROUGH_ERROR_CODES,
                    ),
                  ]),
                )
                .then(eb.ref('combinedTxs.fiat'))
                .else(0)
                .end(),
            ),
            eb.val(0),
          )
          .as('totalSpent'),
    ])
    .as('txStats')
}

function selectNewestIdCardData({ eb, ref }: CustomerWithEditedDataEB) {
  return eb
    .case()
    .when(
      eb.and([
        eb(ref('cstED.idCardDataAt'), 'is not', null),
        eb.or([
          eb(ref('cst.idCardDataAt'), 'is', null),
          eb(ref('cstED.idCardDataAt'), '>', ref('cst.idCardDataAt')),
        ]),
      ]),
    )
    .then(ref('cstED.idCardData'))
    .else(ref('cst.idCardData'))
    .end()
}

interface GetCustomerListOptions {
  withCustomInfoRequest: boolean
}

const defaultOptions: GetCustomerListOptions = {
  withCustomInfoRequest: false,
}

// TODO left join lateral is having issues deriving type
function getCustomerList(
  options: GetCustomerListOptions = defaultOptions,
): Promise<any[]> {
  return db
    .selectFrom('customers as cst')
    .leftJoin('editedCustomerData as cstED', 'cstED.customerId', 'cst.id')
    .leftJoinLateral(joinTxsTotals, join => join.onTrue())
    .leftJoinLateral(joinLatestTx, join => join.onTrue())
    .select(({ eb, fn, val }) => [
      'cst.id',
      'cst.phone',
      'cst.authorizedOverride',
      'cst.frontCameraPath',
      'cst.frontCameraOverride',
      'cst.idCardPhotoPath',
      'cst.idCardPhotoOverride',
      selectNewestIdCardData(eb).as('idCardData'),
      'cst.idCardDataOverride',
      'cst.email',
      'cst.usSsn',
      'cst.usSsnOverride',
      'cst.sanctions',
      'cst.sanctionsOverride',
      'txStats.totalSpent',
      'txStats.totalTxs',
      'lastTx.fiatCode as lastTxFiatCode',
      'lastTx.fiat as lastTxFiat',
      'lastTx.txClass as lastTxClass',
      fn<Date>('GREATEST', [
        'cst.created',
        'lastTx.created',
        'cst.phoneAt',
        'cst.emailAt',
        'cst.idCardDataAt',
        'cst.frontCameraAt',
        'cst.idCardPhotoAt',
        'cst.usSsnAt',
        'cst.lastAuthAttempt',
      ]).as('lastActive'),
      eb('cst.suspendedUntil', '>', fn<Date>('NOW', [])).as('isSuspended'),
      fn<number>('GREATEST', [
        val(0),
        fn<number>('date_part', [
          val('day'),
          eb('cst.suspendedUntil', '-', fn<Date>('NOW', [])),
        ]),
      ]).as('daysSuspended'),
    ])
    .where('cst.id', '!=', ANON_ID)
    .$if(options.withCustomInfoRequest, qb =>
      qb.select(({ eb, ref }) =>
        jsonArrayFrom(
          eb
            .selectFrom('customersCustomInfoRequests')
            .selectAll()
            .where('customerId', '=', ref('cst.id')),
        ).as('customInfoRequestData'),
      ),
    )
    .orderBy('lastActive', 'desc')
    .execute()
}

function searchCustomers(searchTerm: string, limit: number = 20): Promise<any> {
  const searchPattern = `%${searchTerm}%`

  return db
    .selectFrom(
      db
        .selectFrom('customers as cst')
        .leftJoin('editedCustomerData as cstED', 'cstED.customerId', 'cst.id')
        .select(({ eb, fn }) => [
          'cst.id',
          'cst.phone',
          'cst.email',
          sql`CONCAT(
            COALESCE(${selectNewestIdCardData(eb)}->>'firstName', ''),
            ' ',
            COALESCE(${selectNewestIdCardData(eb)}->>'lastName', '')
          )`.as('customerName'),
        ])
        .where('cst.id', '!=', ANON_ID)
        .as('customers_with_names'),
    )
    .selectAll()
    .select('customerName as name')
    .where(({ eb, or }) =>
      or([
        eb('phone', 'ilike', searchPattern),
        eb('email', 'ilike', searchPattern),
        eb('customerName', 'ilike', searchPattern),
      ]),
    )
    .orderBy('id')
    .limit(limit)
    .execute()
}

export { getCustomerList, selectNewestIdCardData, searchCustomers }
