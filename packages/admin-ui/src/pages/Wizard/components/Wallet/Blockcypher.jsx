import { useMutation, useQuery, gql } from '@apollo/client'
import React, { useState } from 'react'
import { P, H4 } from '../../../../components/typography'
import FormRenderer from '../../../Services/FormRenderer'

import { SupportLinkButton, Button } from '../../../../components/buttons'
import { RadioGroup } from '../../../../components/inputs'
import blockcypherSchema from '../../../Services/schemas/blockcypher'

import classes from './Shared.module.css'

const GET_CONFIG = gql`
  {
    accounts
  }
`
const SAVE_ACCOUNTS = gql`
  mutation SaveAccountsBC($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const options = [
  {
    code: 'enable',
    display: 'I will enable cash-out',
  },
  {
    code: 'disable',
    display: "I won't enable cash-out",
  },
]

const Blockcypher = ({ addData }) => {
  const { data } = useQuery(GET_CONFIG)
  const [saveAccounts] = useMutation(SAVE_ACCOUNTS, {
    onCompleted: () => addData({ zeroConf: 'blockcypher' }),
  })

  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  const accounts = data?.accounts ?? []

  const onSelect = e => {
    setSelected(e.target.value)
    setError(false)
  }

  const save = blockcypher => {
    const accounts = { blockcypher }
    return saveAccounts({ variables: { accounts } })
  }

  return (
    <>
      <H4 className={error && classes.error}>Blockcypher</H4>
      <P>
        If you are enabling cash-out services, create a Blockcypher account.
      </P>
      <SupportLinkButton
        link="https://support.lamassu.is/hc/en-us/articles/115001209472-Blockcypher"
        label="Configuring Blockcypher"
      />
      <RadioGroup
        labelClassName={classes.radioLabel}
        className={classes.radioGroup}
        options={options}
        value={selected}
        onChange={onSelect}
      />
      <div className={classes.mdForm}>
        {selected === 'disable' && (
          <Button
            size="lg"
            onClick={() => addData({ zeroConf: 'none', zeroConfLimit: 0 })}
            className={classes.button}>
            Continue
          </Button>
        )}
        {selected === 'enable' && (
          <FormRenderer
            value={accounts.blockcypher}
            save={save}
            elements={blockcypherSchema.elements}
            validationSchema={blockcypherSchema.getValidationSchema}
            buttonLabel={'Continue'}
            buttonClass={classes.formButton}
          />
        )}
      </div>
    </>
  )
}

export default Blockcypher
