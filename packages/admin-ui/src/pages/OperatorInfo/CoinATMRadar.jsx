import { useQuery, useMutation, gql } from '@apollo/client'
import React, { memo } from 'react'

import { BooleanPropertiesTable } from '../../components/booleanPropertiesTable'
import { fromNamespace, toNamespace, namespaces } from '../../utils/config'

import SwitchRow from './components/SwitchRow.jsx'
import Header from './components/Header.jsx'

const GET_CONFIG = gql`
  query getData {
    config
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfigWithTriggers(config: $config)
  }
`

const CoinATMRadar = memo(({ wizard }) => {
  const { data } = useQuery(GET_CONFIG)

  const [saveConfigWithTriggers] = useMutation(SAVE_CONFIG, {
    refetchQueries: ['getData'],
  })

  const save = it =>
    saveConfigWithTriggers({
      variables: { config: toNamespace(namespaces.COIN_ATM_RADAR, it) },
    })

  const coinAtmRadarConfig =
    data?.config && fromNamespace(namespaces.COIN_ATM_RADAR, data.config)
  if (!coinAtmRadarConfig) return null

  return (
    <>
      <Header
        title="Coin ATM Radar share settings"
        articleUrl="https://support.lamassu.is/hc/en-us/articles/360023720472-Coin-ATM-Radar"
        tooltipText="For details on configuring this panel, please read the relevant knowledgebase article."
      />
      <SwitchRow
        title={'Share information?'}
        checked={coinAtmRadarConfig.active}
        save={value => save({ active: value })}
      />
      <BooleanPropertiesTable
        editing={wizard}
        title="Machine info"
        data={coinAtmRadarConfig}
        elements={[
          {
            name: 'commissions',
            display: 'Commissions',
          },
          {
            name: 'limitsAndVerification',
            display: 'Limits and verification',
          },
        ]}
        save={save}
      />
    </>
  )
})

export default CoinATMRadar
