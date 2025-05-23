import { useQuery, useMutation, gql } from '@apollo/client'
import { getEquivalentCode } from '@lamassu/coins/lightUtils'
import * as R from 'ramda'
import React, { useState } from 'react'
import { H4, Info3 } from '../../../../components/typography'
import FormRenderer from '../../../Services/FormRenderer'
import WarningIcon from '../../../../styling/icons/warning-icon/comet.svg?react'

import { Button, SupportLinkButton } from '../../../../components/buttons'
import { RadioGroup } from '../../../../components/inputs'
import _schema from '../../../Services/schemas'

import classes from './Shared.module.css'
import { getItems } from './getItems'

const GET_CONFIG = gql`
  {
    accounts
    accountsConfig {
      code
      display
      class
      cryptos
    }
    cryptoCurrencies {
      code
      display
    }
  }
`

const SAVE_ACCOUNTS = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const isConfigurable = it =>
  !R.isNil(it) && !R.includes(it)(['mock-exchange', 'no-exchange'])

const ChooseExchange = ({ data: currentData, addData }) => {
  const { data } = useQuery(GET_CONFIG)
  const [saveAccounts] = useMutation(SAVE_ACCOUNTS, {
    onCompleted: () => submit(),
  })

  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  const schema = _schema()
  const accounts = data?.accounts ?? []
  const accountsConfig = data?.accountsConfig ?? []

  const coin = getEquivalentCode(currentData.coin)
  const exchanges = getItems(accountsConfig, accounts, 'exchange', coin)

  const submit = () => {
    if (!selected) return setError(true)
    addData({ exchange: selected })
  }

  const saveExchange = name => exchange => {
    const accounts = { [name]: exchange }
    return saveAccounts({ variables: { accounts } })
  }

  const onSelect = e => {
    setSelected(e.target.value)
    setError(false)
  }

  const supportArticles = {
    kraken:
      'https://support.lamassu.is/hc/en-us/articles/115001206891-Kraken-trading',
    itbit:
      'https://support.lamassu.is/hc/en-us/articles/360026195032-itBit-trading',
    bitstamp:
      'https://support.lamassu.is/hc/en-us/articles/115001206911-Bitstamp-trading',
  }

  return (
    <div className={classes.mdForm}>
      <H4 className={error && classes.error}>Choose your exchange</H4>
      <RadioGroup
        labelClassName={classes.radioLabel}
        className={classes.radioGroup}
        options={R.union(exchanges.filled, exchanges.unfilled)}
        value={selected}
        onChange={onSelect}
      />
      {!isConfigurable(selected) && (
        <Button size="lg" onClick={submit} className={classes.button}>
          Continue
        </Button>
      )}
      {isConfigurable(selected) && (
        <>
          <div className={classes.infoMessage}>
            <WarningIcon />
            <Info3>
              Make sure you set up {schema[selected].name} to enter the
              necessary information below. Please follow the instructions on our
              support page if you haven’t.
            </Info3>
          </div>
          <SupportLinkButton
            link={supportArticles[selected]}
            label={`${schema[selected].name} trading`}
          />

          <H4 noMargin>Enter exchange information</H4>
          <FormRenderer
            value={accounts[selected]}
            save={saveExchange(selected)}
            elements={schema[selected].elements}
            validationSchema={schema[selected].getValidationSchema(
              accounts[selected],
            )}
            buttonLabel={'Continue'}
            buttonClass={classes.formButton}
          />
        </>
      )}
    </div>
  )
}

export default ChooseExchange
