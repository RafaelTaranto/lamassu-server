import { useQuery, useMutation, gql } from '@apollo/client'
import Switch from '@mui/material/Switch'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState } from 'react'
import Modal from 'src/components/Modal'
import { HelpTooltip } from 'src/components/Tooltip'
import TitleSection from 'src/components/layout/TitleSection'
import { P, Label2 } from 'src/components/typography'
import FormRenderer from 'src/pages/Services/FormRenderer'
import ReverseCustomInfoIcon from 'src/styling/icons/circle buttons/filter/white.svg?react'
import CustomInfoIcon from 'src/styling/icons/circle buttons/filter/zodiac.svg?react'
import ReverseSettingsIcon from 'src/styling/icons/circle buttons/settings/white.svg?react'
import SettingsIcon from 'src/styling/icons/circle buttons/settings/zodiac.svg?react'

import { Link, SupportLinkButton } from 'src/components/buttons'
import twilioSchema from 'src/pages/Services/schemas/twilio'
import { fromNamespace, toNamespace } from 'src/utils/config'

import CustomInfoRequests from './CustomInfoRequests'
import TriggerView from './TriggerView'
import AdvancedTriggers from './components/AdvancedTriggers'
import { fromServer } from './helper'

const SAVE_ACCOUNT = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const GET_CONFIG = gql`
  query getData {
    config
    accounts
    accountsConfig {
      code
      display
      class
      cryptos
    }
  }
`

const GET_CUSTOM_REQUESTS = gql`
  query customInfoRequests {
    customInfoRequests {
      id
      customRequest
      enabled
    }
  }
`

const Triggers = () => {
  const [wizardType, setWizard] = useState(false)
  const { data, loading: configLoading, refetch } = useQuery(GET_CONFIG)
  const { data: customInfoReqData, loading: customInfoLoading } =
    useQuery(GET_CUSTOM_REQUESTS)
  const [error, setError] = useState(null)
  const [subMenu, setSubMenu] = useState(false)

  const [twilioSetupPopup, setTwilioSetupPopup] = useState(false)

  const enabledCustomInfoRequests = R.pipe(
    R.path(['customInfoRequests']),
    R.defaultTo([]),
    R.filter(R.propEq('enabled', true))
  )(customInfoReqData)

  const emailAuth =
    data?.config?.triggersConfig_customerAuthentication === 'EMAIL'

  const complianceServices = R.filter(R.propEq('class', 'compliance'))(
    data?.accountsConfig || []
  )
  const triggers = fromServer(data?.config?.triggers ?? [])
  const complianceConfig =
    data?.config && fromNamespace('compliance')(data.config)
  const rejectAddressReuse = complianceConfig?.rejectAddressReuse ?? false

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: () => setWizard(false),
    refetchQueries: () => ['getData'],
    onError: error => setError(error)
  })

  const [saveAccount] = useMutation(SAVE_ACCOUNT, {
    onCompleted: () => {
      setTwilioSetupPopup(false)
      toggleWizard('newTrigger')()
    },
    refetchQueries: () => ['getData'],
    onError: error => setError(error)
  })

  const addressReuseSave = rawConfig => {
    const config = toNamespace('compliance')(rawConfig)
    return saveConfig({ variables: { config } })
  }

  const titleSectionWidth = {
    'w-230': !subMenu === 'customInfoRequests'
  }

  const setBlur = shouldBlur => {
    return shouldBlur
      ? document.querySelector('#root').classList.add('root-blur')
      : document.querySelector('#root').classList.remove('root-blur')
  }

  const toggleWizard = wizardName => forceDisable => {
    if (wizardType === wizardName || forceDisable) {
      setBlur(false)
      return setWizard(null)
    }
    setBlur(true)
    return setWizard(wizardName)
  }

  const loading = configLoading || customInfoLoading

  const twilioSave = it => {
    setError(null)
    return saveAccount({
      variables: { accounts: { twilio: it } }
    })
  }
  const addNewTriger = () => {
    if (!R.has('twilio', data?.accounts || {})) setTwilioSetupPopup(true)
    else toggleWizard('newTrigger')()
  }

  return (
    <>
      <TitleSection
        title="Compliance triggers"
        buttons={[
          {
            text: 'Advanced settings',
            icon: SettingsIcon,
            inverseIcon: ReverseSettingsIcon,
            forceDisable: !(subMenu === 'advancedSettings'),
            toggle: show => {
              refetch()
              setSubMenu(show ? 'advancedSettings' : false)
            }
          },
          {
            text: 'Custom info requests',
            icon: CustomInfoIcon,
            inverseIcon: ReverseCustomInfoIcon,
            forceDisable: !(subMenu === 'customInfoRequests'),
            toggle: show => {
              refetch()
              setSubMenu(show ? 'customInfoRequests' : false)
            }
          }
        ]}
        className={classnames(titleSectionWidth)}>
        {!subMenu && (
          <div className="flex items-center">
            <div className="flex items-center justify-end -mr-1">
              <P>Reject reused addresses</P>
              <Switch
                checked={rejectAddressReuse}
                onChange={event => {
                  addressReuseSave({ rejectAddressReuse: event.target.checked })
                }}
                value={rejectAddressReuse}
              />
              <Label2 className="m-3 w-6">
                {rejectAddressReuse ? 'On' : 'Off'}
              </Label2>
              <HelpTooltip width={304}>
                <P>
                  For details about rejecting address reuse, please read the
                  relevant knowledgebase article:
                </P>
                <SupportLinkButton
                  link="https://support.lamassu.is/hc/en-us/articles/360033622211-Reject-Address-Reuse"
                  label="Reject Address Reuse"
                />
              </HelpTooltip>
            </div>
          </div>
        )}
        {subMenu === 'customInfoRequests' &&
          !R.isEmpty(enabledCustomInfoRequests) && (
            <div className="flex justify-end">
              <Link
                color="primary"
                onClick={() => toggleWizard('newCustomRequest')()}>
                + Add new custom info request
              </Link>
            </div>
          )}
        {!loading && !subMenu && !R.isEmpty(triggers) && (
          <div className="flex justify-end">
            <Link color="primary" onClick={addNewTriger}>
              + Add new trigger
            </Link>
          </div>
        )}
      </TitleSection>
      {!loading && subMenu === 'customInfoRequests' && (
        <CustomInfoRequests
          data={enabledCustomInfoRequests}
          showWizard={wizardType === 'newCustomRequest'}
          toggleWizard={toggleWizard('newCustomRequest')}
        />
      )}
      {!loading && !subMenu && (
        <TriggerView
          triggers={triggers}
          showWizard={wizardType === 'newTrigger'}
          config={data?.config ?? {}}
          toggleWizard={toggleWizard('newTrigger')}
          addNewTriger={addNewTriger}
          emailAuth={emailAuth}
          complianceServices={complianceServices}
          customInfoRequests={enabledCustomInfoRequests}
        />
      )}
      {!loading && subMenu === 'advancedSettings' && (
        <AdvancedTriggers
          error={error}
          save={saveConfig}
          data={data}></AdvancedTriggers>
      )}
      {twilioSetupPopup && (
        <Modal
          title={`Configure SMS`}
          width={478}
          handleClose={() => setTwilioSetupPopup(false)}
          open={true}>
          <P>
            In order for compliance triggers to work, you'll first need to
            configure Twilio.
          </P>
          <SupportLinkButton
            link="https://support.lamassu.is/hc/en-us/articles/115001203951-Twilio-for-SMS"
            label="Lamassu Support Article"
          />
          <FormRenderer
            save={twilioSave}
            elements={twilioSchema.elements}
            validationSchema={twilioSchema.getValidationSchema}
          />
        </Modal>
      )}
    </>
  )
}

export default Triggers
