import Paper from '@mui/material/Paper'
import * as R from 'ramda'
import React, { memo } from 'react'
import { Info2, Label3, P } from '../../../../components/typography'
import TxInIcon from '../../../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../../../styling/icons/direction/cash-out.svg?react'

import { numberToFiatAmount } from '../../../../utils/number'
import { singularOrPlural } from '../../../../utils/string'
import { formatDate, formatDateNonUtc } from '../../../../utils/timezones'

const GraphTooltip = ({
  coords,
  data,
  dateInterval,
  currency,
  representing,
}) => {
  const formattedDateInterval = !R.includes('hourOfDay', representing.code)
    ? [
        formatDate(dateInterval[1], null, 'MMM d'),
        formatDate(dateInterval[1], null, 'HH:mm'),
        formatDate(dateInterval[0], null, 'HH:mm'),
      ]
    : [
        formatDate(dateInterval[1], null, 'MMM d'),
        formatDateNonUtc(dateInterval[1], 'HH:mm'),
        formatDateNonUtc(dateInterval[0], 'HH:mm'),
      ]

  const transactions = R.reduce(
    (acc, value) => {
      acc.volume += parseInt(value.fiat)
      if (value.txClass === 'cashIn') acc.cashIn++
      if (value.txClass === 'cashOut') acc.cashOut++
      return acc
    },
    { volume: 0, cashIn: 0, cashOut: 0 },
    data,
  )

  return (
    <Paper
      className="absolute top-[351px] w-[150px] p-3 rounded-lg"
      style={{ left: coords?.x ?? 0 }}>
      {!R.includes('hourOfDay', representing.code) && (
        <Info2 noMargin>{`${formattedDateInterval[0]}`}</Info2>
      )}
      <Info2 noMargin>
        {`${formattedDateInterval[1]} - ${formattedDateInterval[2]}`}
      </Info2>
      <P noMargin className="my-2">
        {R.length(data)}{' '}
        {singularOrPlural(R.length(data), 'transaction', 'transactions')}
      </P>
      <P noMargin className="text-comet">
        {numberToFiatAmount(transactions.volume)} {currency} in volume
      </P>
      <div className="mt-4">
        <Label3 noMargin>
          <TxInIcon />
          <span className="ml-1">{transactions.cashIn} cash-in</span>
        </Label3>
        <Label3 noMargin className="mt-1">
          <TxOutIcon />
          <span className="ml-1">{transactions.cashOut} cash-out</span>
        </Label3>
      </div>
    </Paper>
  )
}

export default memo(GraphTooltip, (prev, next) => prev.coords === next.coords)
