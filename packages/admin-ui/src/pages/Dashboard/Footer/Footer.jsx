import { useQuery, gql } from '@apollo/client'
import BigNumber from 'bignumber.js'
import * as R from 'ramda'
import React from 'react'
import { Label2 } from '../../../components/typography'
import TxInIcon from '../../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../../styling/icons/direction/cash-out.svg?react'

import { fromNamespace } from '../../../utils/config'

import classes from './Footer.module.css'

const GET_DATA = gql`
  query getData {
    cryptoRates
    cryptoCurrencies {
      code
      display
    }
    config
    accountsConfig {
      code
      display
    }
  }
`

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP })

const Footer = () => {
  const { data } = useQuery(GET_DATA)

  const withCommissions = R.path(['cryptoRates', 'withCommissions'])(data) ?? {}
  const config = R.path(['config'])(data) ?? {}
  // const canExpand = R.keys(withCommissions).length > 4

  const wallets = fromNamespace('wallets')(config)
  const cryptoCurrencies = R.path(['cryptoCurrencies'])(data) ?? []
  const accountsConfig = R.path(['accountsConfig'])(data) ?? []
  const localeFiatCurrency = R.path(['locale_fiatCurrency'])(config) ?? ''

  const renderFooterItem = key => {
    const idx = R.findIndex(R.propEq(key, 'code'))(cryptoCurrencies)
    const tickerCode = wallets[`${key}_ticker`]
    const tickerIdx = R.findIndex(R.propEq(tickerCode, 'code'))(accountsConfig)

    const tickerName = tickerIdx > -1 ? accountsConfig[tickerIdx].display : ''

    const cashInNoCommission = parseFloat(
      R.path(['cryptoRates', 'withoutCommissions', key, 'cashIn'])(data),
    )
    const cashOutNoCommission = parseFloat(
      R.path(['cryptoRates', 'withoutCommissions', key, 'cashOut'])(data),
    )

    const avgOfAskBid = new BigNumber(
      (cashInNoCommission + cashOutNoCommission) / 2,
    ).toFormat(2)
    const cashIn = new BigNumber(
      parseFloat(
        R.path(['cryptoRates', 'withCommissions', key, 'cashIn'])(data),
      ),
    ).toFormat(2)
    const cashOut = new BigNumber(
      parseFloat(
        R.path(['cryptoRates', 'withCommissions', key, 'cashOut'])(data),
      ),
    ).toFormat(2)

    return (
      <div className="flex flex-col w-1/4">
        <Label2 className="text-comet mt-3 mb-2">
          {cryptoCurrencies[idx].display}
        </Label2>
        <div className="flex gap-6">
          <div className="flex items-center gap-1">
            <TxInIcon />
            <Label2 noMargin>{`${cashIn} ${localeFiatCurrency}`}</Label2>
          </div>
          <div className="flex items-center gap-1">
            <TxOutIcon />
            <Label2 noMargin>{`${cashOut} ${localeFiatCurrency}`}</Label2>
          </div>
        </div>
        <Label2 className="text-comet mt-2">
          {`${tickerName}: ${avgOfAskBid} ${localeFiatCurrency}`}
        </Label2>
      </div>
    )
  }

  return (
    <div className={classes.footer1}>
      <div className={classes.content1}>
        {R.keys(withCommissions).map(key => renderFooterItem(key))}
      </div>
    </div>
  )
}

export default Footer
