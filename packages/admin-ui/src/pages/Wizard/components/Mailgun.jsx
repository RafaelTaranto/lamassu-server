import { useMutation, useQuery, gql } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { H4, Info3 } from '../../../components/typography'
import FormRenderer from '../../Services/FormRenderer'
import InverseLinkIcon from '../../../styling/icons/action/external link/white.svg?react'
import LinkIcon from '../../../styling/icons/action/external link/zodiac.svg?react'
import WarningIcon from '../../../styling/icons/warning-icon/comet.svg?react'

import { ActionButton } from '../../../components/buttons'
import { RadioGroup } from '../../../components/inputs'
import mailgunSchema from '../../Services/schemas/mailgun'
import classes from '../Radio.module.css'
import { fromNamespace, toNamespace, namespaces } from '../../../utils/config'

const GET_CONFIG = gql`
  {
    config
    accounts
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfigWithTriggers(config: $config)
  }
`
const SAVE_ACCOUNTS = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const options = [
  {
    code: 'enabled',
    display: 'Yes, send notifications to my email',
  },
  {
    code: 'disabled',
    display: "No, don't send email notifications",
  },
]

const Mailgun = () => {
  const { data } = useQuery(GET_CONFIG)
  const [saveConfigWithTriggers] = useMutation(SAVE_CONFIG)
  const [saveAccounts] = useMutation(SAVE_ACCOUNTS)
  const [emailActive, setEmailActive] = useState(false)
  const accounts = data?.accounts ?? []

  const emailConfig =
    data?.config &&
    fromNamespace(namespaces.NOTIFICATIONS + '_email')(data.config)

  useEffect(() => {
    if (emailActive) return
    emailConfig && setEmailActive(emailConfig?.active ? 'enabled' : 'disabled')
  }, [emailActive, emailConfig])

  const handleRadio = enabled => {
    setEmailActive(enabled)
    save(enabled === 'enabled')
  }

  const save = active => {
    const config = toNamespace(`notifications_email`)({ active })
    return saveConfigWithTriggers({ variables: { config } })
  }

  const saveAccount = mailgun => {
    const accounts = { mailgun }
    return saveAccounts({ variables: { accounts } })
  }

  return (
    <div className={classes.mdForm}>
      <H4>Do you want to get notifications via email?</H4>
      <RadioGroup
        labelClassName={classes.mailgunRadioLabel}
        className={classes.mailgunRadioGroup}
        options={options}
        value={emailActive}
        onChange={event => handleRadio(event.target.value)}
      />

      <div className={classes.infoMessage}>
        <WarningIcon />
        <Info3>
          To get email notifications, you’ll need to set up Mailgun. Check out
          our article on how to set it up.
        </Info3>
      </div>
      <ActionButton
        className={classes.actionButton}
        color="primary"
        Icon={LinkIcon}
        InverseIcon={InverseLinkIcon}>
        <a
          className={classes.actionButtonLink}
          target="_blank"
          rel="noopener noreferrer"
          href="https://support.lamassu.is/hc/en-us/articles/115001203991-Email-notifications-with-Mailgun">
          Email notifications with Mailgun
        </a>
      </ActionButton>

      {emailActive === 'enabled' && (
        <>
          <H4>Mailgun credentials</H4>
          <FormRenderer
            value={accounts.mailgun}
            save={saveAccount}
            elements={mailgunSchema.elements}
            validationSchema={mailgunSchema.getValidationSchema(
              accounts.mailgun,
            )}
            buttonLabel={'Save'}
          />
        </>
      )}
    </div>
  )
}

export default Mailgun
