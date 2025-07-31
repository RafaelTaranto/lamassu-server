import { useQuery, gql } from '@apollo/client'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState } from 'react'
import { Info2, Label1, Label2, P } from '../../../components/typography/index'
import PercentDownIcon from '../../../styling/icons/dashboard/down.svg?react'
import PercentNeutralIcon from '../../../styling/icons/dashboard/equal.svg?react'
import PercentUpIcon from '../../../styling/icons/dashboard/up.svg?react'

import { EmptyTable } from '../../../components/table'
import { java, neon } from '../../../styling/variables'
import { fromNamespace } from '../../../utils/config'
import { DAY, WEEK, MONTH } from '../../../utils/time'
import { timezones } from '../../../utils/timezone-list'

import PercentageChart from './Graphs/PercentageChart'
import LineChart from './Graphs/RefLineChart'
import Scatterplot from './Graphs/RefScatterplot'
import InfoWithLabel from './InfoWithLabel'
import Nav from './Nav'

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP })

const sumBNBy = by =>
  R.reduce((acc, value) => acc.plus(by(value)), new BigNumber(0))

const getProfit = sumBNBy(tx => tx.profit)

const GET_DATA = gql`
  query getData($excludeTestingCustomers: Boolean, $from: DateTimeISO) {
    transactions(
      excludeTestingCustomers: $excludeTestingCustomers
      from: $from
    ) {
      fiatCode
      fiat
      created
      txClass
      error
      profit
      dispense
      sendConfirmed
    }
    fiatRates {
      code
      name
      rate
    }
    configWithAllTriggers
  }
`

const twoMonthsAgo = new Date()
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

const SystemPerformance = () => {
  const [selectedRange, setSelectedRange] = useState('Day')

  const { data, loading } = useQuery(GET_DATA, {
    variables: {
      excludeTestingCustomers: true,
      from: twoMonthsAgo.toISOString(),
    },
  })
  const fiatLocale = fromNamespace('locale')(
    data?.configWithAllTriggers,
  ).fiatCurrency
  const timezone = fromNamespace('locale')(data?.configWithAllTriggers).timezone
  const allTransactions = data?.transactions ?? []

  const NOW = Date.now()

  const periodDomains = {
    Day: [NOW - DAY, NOW],
    Week: [NOW - WEEK, NOW],
    Month: [NOW - MONTH, NOW],
  }

  const isInRangeAndNoError = getLastTimePeriod => t => {
    if (t.error !== null) return false
    if (t.txClass === 'cashOut' && !t.dispense) return false
    if (t.txClass === 'cashIn' && !t.sendConfirmed) return false

    const createdTimestamp = new Date(t.created).getTime()
    const [rangeStart, rangeEnd] = periodDomains[selectedRange]

    if (getLastTimePeriod) {
      const duration = rangeEnd - rangeStart
      return (
        createdTimestamp >= rangeStart - duration &&
        createdTimestamp < rangeStart
      )
    }

    return createdTimestamp >= rangeStart && createdTimestamp <= rangeEnd
  }

  const convertFiatToLocale = item => {
    if (item.fiatCode === fiatLocale)
      return {
        ...item,
        fiat: new BigNumber(item.fiat),
        profit: new BigNumber(item.profit),
      }
    const itemRate = R.find(R.propEq(item.fiatCode, 'code'))(data.fiatRates)
    const localeRate = R.find(R.propEq(fiatLocale, 'code'))(data.fiatRates)
    const multiplier = localeRate.rate / itemRate.rate
    return {
      ...item,
      fiat: new BigNumber(item.fiat).times(multiplier),
      profit: new BigNumber(item.profit).times(multiplier),
    }
  }

  const prepareTransactions = getLastTimePeriod =>
    allTransactions
      .filter(isInRangeAndNoError(getLastTimePeriod))
      .map(convertFiatToLocale)

  const transactionsToShow = prepareTransactions(false)
  const transactionsLastTimePeriod = prepareTransactions(true)

  const getNumTransactions = () => {
    return R.length(transactionsToShow)
  }

  const getFiatVolume = () =>
    sumBNBy(tx => tx.fiat)(transactionsToShow).toFormat(2)

  const getPercentChange = () => {
    const thisTimePeriodProfit = getProfit(transactionsToShow)
    const previousTimePeriodProfit = getProfit(transactionsLastTimePeriod)

    if (thisTimePeriodProfit.eq(previousTimePeriodProfit)) return 0
    if (previousTimePeriodProfit.eq(0)) return 100

    return thisTimePeriodProfit
      .minus(previousTimePeriodProfit)
      .times(100)
      .div(previousTimePeriodProfit)
      .toNumber()
  }

  const getDirectionPercent = () => {
    const [cashIn, cashOut] = R.partition(R.propEq('cashIn', 'txClass'))(
      transactionsToShow,
    )
    const totalLength = cashIn.length + cashOut.length
    if (totalLength === 0) {
      return { cashIn: 0, cashOut: 0 }
    }

    return {
      cashIn: Math.round((cashIn.length / totalLength) * 100),
      cashOut: Math.round((cashOut.length / totalLength) * 100),
    }
  }

  const percentChange = getPercentChange()

  const percentageClasses = {
    'text-tomato': percentChange < 0,
    'text-spring4': percentChange > 0,
    'text-comet': percentChange === 0,
    'flex items-center justify-center gap-1': true,
  }

  const getPercentageIcon = () => {
    const className = 'w-4 h-4'
    if (percentChange === 0) return <PercentNeutralIcon className={className} />
    if (percentChange > 0) return <PercentUpIcon className={className} />
    return <PercentDownIcon className={className} />
  }

  return (
    <>
      <Nav
        showPicker={!loading && !R.isEmpty(allTransactions)}
        handleSetRange={setSelectedRange}
      />
      {!loading && R.isEmpty(allTransactions) && (
        <EmptyTable
          className="pt-10"
          message="No transactions during the last month"
        />
      )}
      {!loading && !R.isEmpty(allTransactions) && (
        <div className="flex flex-col gap-12">
          <div className="flex gap-16">
            <InfoWithLabel info={getNumTransactions()} label={'transactions'} />
            <InfoWithLabel
              info={getFiatVolume()}
              label={`${data?.configWithAllTriggers.locale_fiatCurrency} volume`}
            />
          </div>
          <div className="h-62">
            <div className="flex justify-between mb-4">
              <Label2 noMargin>Transactions</Label2>
              <div className="flex items-center">
                <P noMargin>
                  {timezones[timezone]?.short ?? timezones[timezone]?.long}{' '}
                  timezone
                </P>
                <span className="h-4 w-[1px] bg-comet2 mr-4 ml-8" />
                <div className="flex flex-row gap-4">
                  <div className="flex items-center">
                    <svg width={8} height={8}>
                      <rect width={8} height={8} rx={4} fill={java} />
                    </svg>
                    <Label1 noMargin className="ml-2">
                      In
                    </Label1>
                  </div>
                  <div className="flex items-center">
                    <svg width={8} height={8}>
                      <rect width={8} height={8} rx={4} fill={neon} />
                    </svg>
                    <Label1 noMargin className="ml-2">
                      Out
                    </Label1>
                  </div>
                </div>
              </div>
            </div>
            <Scatterplot
              timeFrame={selectedRange}
              data={transactionsToShow}
              timezone={timezone}
            />
          </div>
          <div className="flex h-62">
            <div className="flex-2">
              <Label2 noMargin className="mb-4">
                Profit from commissions
              </Label2>
              <div className="flex justify-between mt-6 mr-7 -mb-8 ml-4 relative">
                <Info2 noMargin>
                  {`${getProfit(transactionsToShow).toFormat(2)} ${
                    data?.configWithAllTriggers.locale_fiatCurrency
                  }`}
                </Info2>
                <Info2 noMargin className={classnames(percentageClasses)}>
                  {getPercentageIcon()}
                  {`${new BigNumber(percentChange).toFormat(2)}%`}
                </Info2>
              </div>
              <LineChart
                timeFrame={selectedRange}
                data={transactionsToShow}
                previousTimeData={transactionsLastTimePeriod}
                previousProfit={getProfit(
                  transactionsLastTimePeriod,
                ).toNumber()}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <Label2 noMargin>Direction</Label2>
                <div className="flex flex-row gap-4">
                  <div className="flex items-center">
                    <svg width={8} height={8}>
                      <rect width={8} height={8} rx={2} fill={java} />
                    </svg>
                    <Label1 noMargin className="ml-2">
                      In
                    </Label1>
                  </div>
                  <div className="flex items-center">
                    <svg width={8} height={8}>
                      <rect width={8} height={8} rx={2} fill={neon} />
                    </svg>
                    <Label1 noMargin className="ml-2">
                      Out
                    </Label1>
                  </div>
                </div>
              </div>
              <PercentageChart {...getDirectionPercent()} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SystemPerformance
