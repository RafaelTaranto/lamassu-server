import { toUnit } from '@lamassu/coins/lightUtils'
import BigNumber from 'bignumber.js'
import * as R from 'ramda'
import React from 'react'
import DataTable from '../../../components/tables/DataTable'
import { H3, H4, Label1, Label2, P } from '../../../components/typography'
import TxInIcon from '../../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../../styling/icons/direction/cash-out.svg?react'

import { ifNotNull } from '../../../utils/nullCheck'
import { formatDate } from '../../../utils/timezones'

import CopyToClipboard from '../../../components/CopyToClipboard.jsx'

const TransactionsList = ({ customer, data, loading }) => {
  const LastTxIcon = customer.lastTxClass === 'cashOut' ? TxOutIcon : TxInIcon
  const hasData = !(R.isEmpty(data) || R.isNil(data))
  const { lastUsedMachineName } = customer

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const summaryElements = [
    {
      header: 'Transactions',
      size: 127,
      value: ifNotNull(
        customer.totalTxs,
        `${Number.parseInt(customer.totalTxs)}`,
      ),
    },
    {
      header: 'Transaction volume',
      size: 167,
      value: ifNotNull(
        customer.totalSpent,
        `${Number.parseFloat(customer.totalSpent)} ${customer.lastTxFiatCode}`,
      ),
    },
    {
      header: 'Last active',
      size: 142,
      value:
        !R.isNil(timezone) &&
        ((customer.lastActive &&
          formatDate(customer.lastActive, timezone, 'yyyy-MM-dd')) ??
          ''),
    },
    {
      header: 'Last transaction',
      size: 198,
      value: ifNotNull(
        customer.lastTxFiat,
        <>
          <LastTxIcon className="mr-3" />
          {`${Number.parseFloat(customer.lastTxFiat)} 
            ${customer.lastTxFiatCode}`}
        </>,
      ),
    },
    {
      header: 'Last used machine',
      size: 198,
      value: ifNotNull(lastUsedMachineName, <>{lastUsedMachineName}</>),
    },
  ]

  const tableElements = [
    {
      width: 40,
      view: it => (
        <>
          {it.txClass === 'cashOut' ? (
            <TxOutIcon className="mr-3" />
          ) : (
            <TxInIcon className="mr-3" />
          )}
        </>
      ),
    },
    {
      header: 'Machine',
      width: 160,
      view: R.path(['machineName']),
    },
    {
      header: 'Transaction ID',
      width: 145,
      view: it => (
        <CopyToClipboard className="font-museo whitespace-nowrap overflow-hidden text-ellipsis">
          {it.id}
        </CopyToClipboard>
      ),
    },
    {
      header: 'Cash',
      width: 155,
      textAlign: 'right',
      view: it => (
        <>
          {`${Number.parseFloat(it.fiat)} `}
          <Label2 inline>{it.fiatCode}</Label2>
        </>
      ),
    },
    {
      header: 'Crypto',
      width: 145,
      textAlign: 'right',
      view: it => (
        <>
          {`${toUnit(new BigNumber(it.cryptoAtoms), it.cryptoCode).toFormat(
            5,
          )} `}
          <Label2 inline>{it.cryptoCode}</Label2>
        </>
      ),
    },
    {
      header: 'Date',
      width: 100,
      view: it => formatDate(it.created, timezone, 'yyyy‑MM‑dd'),
    },
    {
      header: 'Time (h:m:s)',
      width: 130,
      view: it => formatDate(it.created, timezone, 'HH:mm:ss'),
    },
  ]

  return (
    <>
      <H3>Transactions</H3>
      <div className="flex flex-col">
        <div className="flex mt-auto">
          {summaryElements.map(({ size, header }, idx) => (
            <Label1
              noMargin
              key={idx}
              className="text-comet mb-1 mr-6"
              style={{ width: size }}>
              {header}
            </Label1>
          ))}
        </div>
        <div className="flex">
          {summaryElements.map(({ size, value }, idx) => (
            <P noMargin key={idx} className="h-4 mr-6" style={{ width: size }}>
              {value}
            </P>
          ))}
        </div>
      </div>
      <div className="flex mt-5">
        {loading ? (
          <H4>Loading</H4>
        ) : hasData ? (
          <DataTable elements={tableElements} data={data} />
        ) : (
          <H4>No transactions so far</H4>
        )}
      </div>
    </>
  )
}

export default TransactionsList
