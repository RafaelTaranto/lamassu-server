import BigNumber from 'bignumber.js'
import * as R from 'ramda'
import React from 'react'
import { Info1, Info2, Info3 } from 'src/components/typography/index'
import TxInIcon from 'src/styling/icons/direction/cash-in.svg?react'
import TxOutIcon from 'src/styling/icons/direction/cash-out.svg?react'

import { fromNamespace } from 'src/utils/config'
import { numberToFiatAmount } from 'src/utils/number'

const CashCassettesFooter = ({ machines, config, currencyCode, bills }) => {
  const cashout = config && fromNamespace('cashOut')(config)
  const getCashoutSettings = id => fromNamespace(id)(cashout)
  const cashoutReducerFn = (
    acc,
    { cashUnits: { cassette1, cassette2, cassette3, cassette4 }, id },
  ) => {
    const cassette1Denomination = getCashoutSettings(id).cassette1 ?? 0
    const cassette2Denomination = getCashoutSettings(id).cassette2 ?? 0
    const cassette3Denomination = getCashoutSettings(id).cassette3 ?? 0
    const cassette4Denomination = getCashoutSettings(id).cassette4 ?? 0
    return [
      (acc[0] += cassette1 * cassette1Denomination),
      (acc[1] += cassette2 * cassette2Denomination),
      (acc[2] += cassette3 * cassette3Denomination),
      (acc[3] += cassette4 * cassette4Denomination),
    ]
  }

  const recyclerReducerFn = (
    acc,
    {
      cashUnits: {
        recycler1,
        recycler2,
        recycler3,
        recycler4,
        recycler5,
        recycler6,
      },
      id,
    },
  ) => {
    const recycler1Denomination = getCashoutSettings(id).recycler1 ?? 0
    const recycler2Denomination = getCashoutSettings(id).recycler2 ?? 0
    const recycler3Denomination = getCashoutSettings(id).recycler3 ?? 0
    const recycler4Denomination = getCashoutSettings(id).recycler4 ?? 0
    const recycler5Denomination = getCashoutSettings(id).recycler5 ?? 0
    const recycler6Denomination = getCashoutSettings(id).recycler6 ?? 0
    return [
      (acc[0] += recycler1 * recycler1Denomination),
      (acc[1] += recycler2 * recycler2Denomination),
      (acc[0] += recycler3 * recycler3Denomination),
      (acc[1] += recycler4 * recycler4Denomination),
      (acc[0] += recycler5 * recycler5Denomination),
      (acc[1] += recycler6 * recycler6Denomination),
    ]
  }

  const totalInRecyclers = R.sum(
    R.reduce(recyclerReducerFn, [0, 0, 0, 0, 0, 0], machines),
  )

  const totalInCassettes = R.sum(
    R.reduce(cashoutReducerFn, [0, 0, 0, 0], machines),
  )

  const totalInCashBox = R.sum(R.map(it => it.fiat)(bills))

  const total = new BigNumber(
    totalInCassettes + totalInCashBox + totalInRecyclers,
  ).toFormat(0)

  return (
    <div className="fixed h-16 left-0 bottom-0 w-[100vw] bg-white flex justify-around shadow-2xl">
      <div className="w-300 max-h-16 flex fixed justify-around">
        <Info3 className="text-comet self-center">Cash value in System</Info3>
        <div className="flex">
          <TxInIcon className="self-center h-5 w-5 mr-2" />
          <Info2 className="self-center mr-2">Cash-in:</Info2>
          <Info1 className="self-center">
            {numberToFiatAmount(totalInCashBox)} {currencyCode}
          </Info1>
        </div>
        <div className="flex gap-2">
          <TxOutIcon className="self-center h-5 w-5" />
          <Info2 className="self-center">Cash-out:</Info2>
          <Info1 className="self-center">
            {numberToFiatAmount(totalInCassettes)} {currencyCode}
          </Info1>
        </div>
        <div className="flex gap-2">
          <TxOutIcon className="self-center h-5 w-5" />
          <Info2 className="self-center">Recycle:</Info2>
          <Info1 className="self-center">
            {numberToFiatAmount(totalInRecyclers)} {currencyCode}
          </Info1>
        </div>
        <div className="flex gap-2">
          <Info2 className="self-center">Total:</Info2>
          <Info1 className="self-center">
            {numberToFiatAmount(total)} {currencyCode}
          </Info1>
        </div>
      </div>
    </div>
  )
}

export default CashCassettesFooter
