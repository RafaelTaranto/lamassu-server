import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { memo } from 'react'

import { BooleanPropertiesTable } from '../../components/booleanPropertiesTable'
import { fromNamespace, toNamespace, namespaces } from '../../utils/config'

import Header from './components/Header.jsx'
import SwitchRow from './components/SwitchRow.jsx'

const GET_CONFIG = gql`
  query getData {
    configWithAllTriggers
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const ReceiptPrinting = memo(({ wizard }) => {
  const { data } = useQuery(GET_CONFIG)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    refetchQueries: () => ['getData'],
  })

  const saveSwitch = object => {
    return saveConfig({
      variables: {
        config: toNamespace(
          namespaces.RECEIPT,
          R.mergeRight(receiptPrintingConfig, object),
        ),
      },
    })
  }

  const save = it =>
    saveConfig({
      variables: { config: toNamespace(namespaces.RECEIPT, it) },
    })

  const receiptPrintingConfig =
    data?.configWithAllTriggers &&
    fromNamespace(namespaces.RECEIPT, data.configWithAllTriggers)
  if (!receiptPrintingConfig) return null

  return (
    <>
      <Header
        title="Receipt printing"
        tooltipText="For details on configuring this panel, please read the relevant knowledgebase article."
        articleUrl="https://support.lamassu.is/hc/en-us/articles/360058513951-Receipt-options-printers"
      />
      <SwitchRow
        title="Enable receipt printing"
        checked={receiptPrintingConfig.active}
        save={it => saveSwitch({ active: it })}
      />
      <SwitchRow
        title="Automatic receipt printing"
        checked={receiptPrintingConfig.automaticPrint}
        save={it => saveSwitch({ automaticPrint: it })}
      />
      <SwitchRow
        title="Offer SMS receipt"
        checked={receiptPrintingConfig.sms}
        save={it => saveSwitch({ sms: it })}
      />
      <BooleanPropertiesTable
        editing={wizard}
        title={'Visible on the receipt (options)'}
        data={receiptPrintingConfig}
        elements={[
          {
            name: 'operatorWebsite',
            display: 'Operator website',
          },
          {
            name: 'operatorEmail',
            display: 'Operator email',
          },
          {
            name: 'operatorPhone',
            display: 'Operator phone',
          },
          {
            name: 'companyNumber',
            display: 'Company registration number',
          },
          {
            name: 'machineLocation',
            display: 'Machine location',
          },
          {
            name: 'customerNameOrPhoneNumber',
            display: 'Customer name or phone number (if known)',
          },
          {
            name: 'exchangeRate',
            display: 'Exchange rate',
          },
          {
            name: 'addressQRCode',
            display: 'Address QR code',
          },
        ]}
        save={save}
      />
    </>
  )
})

export default ReceiptPrinting
