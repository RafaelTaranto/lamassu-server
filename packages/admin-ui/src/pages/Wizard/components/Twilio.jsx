import { useMutation, useQuery, gql } from '@apollo/client'
import classnames from 'classnames'
import React, { useState } from 'react'
import { HelpTooltip } from 'src/components/Tooltip'
import { H1, H4, Label1, P } from 'src/components/typography'
import FormRenderer from 'src/pages/Services/FormRenderer'
import WarningIcon from 'src/styling/icons/warning-icon/comet.svg?react'

import { Button, SupportLinkButton } from 'src/components/buttons'
import { RadioGroup } from 'src/components/inputs'
import twilio from 'src/pages/Services/schemas/twilio'

import sharedClasses from './Wallet/Shared.module.css'
import classes from './Twilio.module.css'

const GET_CONFIG = gql`
  {
    config
    accounts
  }
`

const SAVE_ACCOUNTS = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const options = [
  {
    code: 'enable',
    display: 'Yes, I will'
  },
  {
    code: 'disable',
    display: 'No, not for now'
  }
]

function Twilio({ doContinue }) {
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  const { data, refetch } = useQuery(GET_CONFIG)
  const [saveAccounts] = useMutation(SAVE_ACCOUNTS, {
    onCompleted: doContinue
  })

  const accounts = data?.accounts ?? []

  const onSelect = e => {
    setSelected(e.target.value)
    setError(false)
  }

  const clickContinue = () => {
    if (!selected) return setError(true)
    doContinue()
  }

  const save = twilio => {
    const accounts = { twilio }
    return saveAccounts({ variables: { accounts } }).then(() => refetch())
  }

  const titleClasses = {
    'ml-2 mb-2': true,
    [sharedClasses.error]: error
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <H1>Twilio (SMS service)</H1>
        <div className="flex items-end">
          <H4 noMargin className={classnames(titleClasses)}>
            Will you setup a two way machine or compliance?
          </H4>
          <HelpTooltip width={304}>
            <P>
              Two-way machines allow your customers not only to buy (cash-in)
              but also sell cryptocurrencies (cash-out).
            </P>
            <P>
              You’ll need an SMS service for cash-out transactions and for any
              compliance triggers
            </P>
          </HelpTooltip>
        </div>

        <RadioGroup
          labelClassName={classes.radioLabel}
          className={sharedClasses.radioGroup}
          options={options}
          value={selected}
          onChange={onSelect}
        />

        <div className="flex gap-4 mt-5 mb-8 items-center">
          <WarningIcon />
          <Label1 noMargin>
            To set up Twilio please read the instructions from our support
            portal.
          </Label1>
        </div>
        <SupportLinkButton
          link="https://support.lamassu.is/hc/en-us/articles/115001203951-Twilio-for-SMS"
          label="Twilio for SMS"
        />

        {selected === 'enable' && (
          <>
            <H4 noMargin>Enter credentials</H4>
            <FormRenderer
              xs={6}
              save={save}
              value={accounts.twilio}
              elements={twilio.elements}
              validationSchema={twilio.getValidationSchema(accounts.twilio)}
              buttonLabel={'Continue'}
              buttonClass={sharedClasses.formButton}
            />
          </>
        )}
        {selected !== 'enable' && (
          <Button
            size="lg"
            onClick={clickContinue}
            className={sharedClasses.button}>
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}

export default Twilio
