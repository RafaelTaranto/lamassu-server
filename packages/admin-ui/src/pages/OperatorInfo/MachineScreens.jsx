import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { memo } from 'react'
import { H4 } from 'src/components/typography'

import { fromNamespace, toNamespace, namespaces } from 'src/utils/config'

import SwitchRow from './components/SwitchRow.jsx'

const GET_CONFIG = gql`
  query getData {
    config
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const MachineScreens = memo(() => {
  const { data } = useQuery(GET_CONFIG)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    refetchQueries: () => ['getData'],
  })

  const save = it => {
    const formatConfig = R.compose(
      toNamespace(namespaces.MACHINE_SCREENS),
      toNamespace('rates'),
      R.mergeRight(ratesScreenConfig),
    )

    return saveConfig({
      variables: {
        config: formatConfig({ active: it }),
      },
    })
  }

  const machineScreensConfig =
    data?.config && fromNamespace(namespaces.MACHINE_SCREENS, data.config)

  const ratesScreenConfig =
    data?.config &&
    R.compose(
      fromNamespace('rates'),
      fromNamespace(namespaces.MACHINE_SCREENS),
    )(data.config)

  if (!machineScreensConfig) return null

  return (
    <>
      <H4>Rates screen</H4>
      <SwitchRow
        save={save}
        title="Enable rates screen"
        checked={ratesScreenConfig.active}
      />
    </>
  )
})

export default MachineScreens
