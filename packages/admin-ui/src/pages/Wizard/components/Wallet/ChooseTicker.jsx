import { useQuery, gql } from '@apollo/client'
import { getEquivalentCode } from '@lamassu/coins/lightUtils'
import * as R from 'ramda'
import React, { useState } from 'react'
import { H4 } from 'src/components/typography'

import { Button } from 'src/components/buttons'
import { RadioGroup } from 'src/components/inputs'

import classes from './Shared.module.css'
import { getItems } from './getItems'

const GET_CONFIG = gql`
  {
    accountsConfig {
      code
      display
      class
      cryptos
    }
  }
`

const ChooseTicker = ({ data: currentData, addData }) => {
  const { data } = useQuery(GET_CONFIG)

  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  const accounts = data?.accounts ?? []
  const accountsConfig = data?.accountsConfig ?? []

  const coin = getEquivalentCode(currentData.coin)
  const tickers = getItems(accountsConfig, accounts, 'ticker', coin)

  const submit = () => {
    if (!selected) return setError(true)
    addData({ ticker: selected })
  }

  const onSelect = e => {
    setSelected(e.target.value)
    setError(false)
  }

  return (
    <div className={classes.mdForm}>
      <H4 className={error && classes.error}>Choose your ticker</H4>
      <RadioGroup
        labelClassName={classes.radioLabel}
        className={classes.radioGroup}
        options={R.union(tickers.filled, tickers.unfilled)}
        value={selected}
        onChange={onSelect}
      />
      <Button size="lg" onClick={submit} className={classes.button}>
        Continue
      </Button>
    </div>
  )
}

export default ChooseTicker
