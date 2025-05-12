import { useQuery, gql } from '@apollo/client'
import * as R from 'ramda'
import React from 'react'
import DataTable from 'src/components/tables/DataTable'
import TxInIcon from 'src/styling/icons/direction/cash-in.svg?react'
import TxOutIcon from 'src/styling/icons/direction/cash-out.svg?react'

import { NumberInput } from 'src/components/inputs/formik'
import { formatDate } from 'src/utils/timezones'

const GET_BATCHES = gql`
  query cashboxBatches {
    cashboxBatches {
      id
      deviceId
      created
      operationType
      customBillCount
      performedBy
      billCount
      fiatTotal
    }
  }
`

const CashboxHistory = ({ machines, currency, timezone }) => {
  const { data: batchesData, loading: batchesLoading } = useQuery(GET_BATCHES)

  const loading = batchesLoading

  const batches = R.path(['cashboxBatches'])(batchesData)

  const getOperationRender = R.reduce(
    (ret, i) =>
      R.pipe(
        R.assoc(
          `cash-cassette-${i}-refill`,
          <>
            <TxOutIcon />
            <span>Cash cassette {i} refill</span>
          </>
        ),
        R.assoc(
          `cash-cassette-${i}-empty`,
          <>
            <TxOutIcon />
            <span>Cash cassette {i} emptied</span>
          </>
        )
      )(ret),
    {
      'cash-box-empty': (
        <>
          <TxInIcon />
          <span>Cash box emptied</span>
        </>
      )
    },
    R.range(1, 5)
  )

  const elements = [
    {
      name: 'operation',
      header: 'Operation',
      width: 200,
      textAlign: 'left',
      view: it => (
        <div className="flex items-center gap-2">
          {getOperationRender[it.operationType]}
        </div>
      )
    },
    {
      name: 'machine',
      header: 'Machine',
      width: 200,
      textAlign: 'left',
      view: R.pipe(
        R.prop('deviceId'),
        id => R.find(R.propEq('id', id), machines),
        R.defaultTo({ name: <i>Unpaired device</i> }),
        R.prop('name')
      )
    },
    {
      name: 'billCount',
      header: 'Bill count',
      width: 115,
      textAlign: 'left',
      input: NumberInput,
      inputProps: {
        decimalPlaces: 0
      },
      view: it =>
        R.isNil(it.customBillCount) ? it.billCount : it.customBillCount
    },
    {
      name: 'total',
      header: 'Total',
      width: 180,
      textAlign: 'right',
      view: it => (
        <span>
          {it.fiatTotal} {currency}
        </span>
      )
    },
    {
      name: 'date',
      header: 'Date',
      width: 135,
      textAlign: 'right',
      view: it => formatDate(it.created, timezone, 'yyyy-MM-dd')
    },
    {
      name: 'time',
      header: 'Time (h:m)',
      width: 125,
      textAlign: 'right',
      view: it => formatDate(it.created, timezone, 'HH:mm')
    }
  ]

  return (
    <div className="flex flex-col flex-1 mb-20">
      <DataTable
        loading={loading}
        name="cashboxHistory"
        elements={elements}
        data={batches}
        emptyText="No cash box batches so far"
      />
    </div>
  )
}

export default CashboxHistory
