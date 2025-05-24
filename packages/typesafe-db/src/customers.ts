import db from './db.js'
import { ExpressionBuilder } from 'kysely'
import { Customers, DB, EditedCustomerData } from './types/types.js'
import { jsonArrayFrom } from 'kysely/helpers/postgres'

type CustomerEB = ExpressionBuilder<DB & { c: Customers }, 'c'>
type CustomerWithEditedEB = ExpressionBuilder<
  DB & { c: Customers } & { e: EditedCustomerData | null },
  'c' | 'e'
>

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
        eb('customerId', '=', ref('c.id')),
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
            eb('customerId', '=', ref('c.id')),
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

function selectNewestIdCardData(eb: CustomerWithEditedEB, ref: any) {
  return eb
    .case()
    .when(
      eb.and([
        eb(ref('e.idCardDataAt'), 'is not', null),
        eb.or([
          eb(ref('c.idCardDataAt'), 'is', null),
          eb(ref('e.idCardDataAt'), '>', ref('c.idCardDataAt')),
        ]),
      ]),
    )
    .then(ref('e.idCardData'))
    .else(ref('c.idCardData'))
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
    .selectFrom('customers as c')
    .leftJoin('editedCustomerData as e', 'e.customerId', 'c.id')
    .leftJoinLateral(joinTxsTotals, join => join.onTrue())
    .leftJoinLateral(joinLatestTx, join => join.onTrue())
    .select(({ eb, fn, val, ref }) => [
      'c.id',
      'c.authorizedOverride',
      'c.frontCameraPath',
      'c.frontCameraOverride',
      'c.idCardPhotoPath',
      'c.idCardPhotoOverride',
      selectNewestIdCardData(eb, ref).as('idCardData'),
      'c.idCardDataOverride',
      'c.email',
      'c.usSsn',
      'c.usSsnOverride',
      'c.sanctions',
      'c.sanctionsOverride',
      'txStats.totalSpent',
      'txStats.totalTxs',
      ref('lastTx.fiatCode').as('lastTxFiatCode'),
      ref('lastTx.fiat').as('lastTxFiat'),
      ref('lastTx.txClass').as('lastTxClass'),
      fn<Date>('GREATEST', [
        'c.created',
        'lastTx.created',
        'c.phoneAt',
        'c.emailAt',
        'c.idCardDataAt',
        'c.frontCameraAt',
        'c.idCardPhotoAt',
        'c.usSsnAt',
        'c.lastAuthAttempt',
      ]).as('lastActive'),
      eb('c.suspendedUntil', '>', fn<Date>('NOW', [])).as('isSuspended'),
      fn<number>('GREATEST', [
        val(0),
        fn<number>('date_part', [
          val('day'),
          eb('c.suspendedUntil', '-', fn<Date>('NOW', [])),
        ]),
      ]).as('daysSuspended'),
    ])
    .$if(options.withCustomInfoRequest, qb =>
      qb.select(({ eb, ref }) =>
        jsonArrayFrom(
          eb
            .selectFrom('customersCustomInfoRequests')
            .selectAll()
            .where('customerId', '=', ref('c.id')),
        ).as('customInfoRequestData'),
      ),
    )
    .orderBy('lastActive', 'desc')
    .execute()
}

export { getCustomerList }
