import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import { HelpTooltip } from '../../components/Tooltip'
import TitleSection from '../../components/layout/TitleSection'
import { P } from '../../components/typography'

import { SupportLinkButton } from '../../components/buttons'
import { NamespacedTable as EditableTable } from '../../components/editableTable'
import { EmptyTable } from '../../components/table'
import { fromNamespace, toNamespace } from '../../utils/config'

import Wizard from './Wizard'
import { DenominationsSchema, getElements } from './helper'

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const GET_INFO = gql`
  query getData {
    machines {
      name
      deviceId
      cashUnits {
        cashbox
        cassette1
        cassette2
        cassette3
        cassette4
        recycler1
        recycler2
        recycler3
        recycler4
        recycler5
        recycler6
      }
      numberOfCassettes
      numberOfRecyclers
    }
    configWithAllTriggers
  }
`

const CashOut = ({ name: SCREEN_KEY }) => {
  const [wizard, setWizard] = useState(false)
  const { data, loading } = useQuery(GET_INFO)

  const [saveConfig, { error }] = useMutation(SAVE_CONFIG, {
    onCompleted: () => setWizard(false),
    refetchQueries: () => ['getData'],
  })

  const save = rawConfig => {
    const config = toNamespace(SCREEN_KEY)(rawConfig)
    return saveConfig({ variables: { config } })
  }

  const config =
    data?.configWithAllTriggers &&
    fromNamespace(SCREEN_KEY)(data.configWithAllTriggers)

  const locale =
    data?.configWithAllTriggers &&
    fromNamespace('locale')(data.configWithAllTriggers)
  const machines = data?.machines ?? []

  const onToggle = id => {
    const namespaced = fromNamespace(id)(config)
    if (!DenominationsSchema.isValidSync(namespaced)) return setWizard(id)
    save(toNamespace(id, { active: !namespaced?.active }))
  }

  const wasNeverEnabled = it => R.compose(R.length, R.keys)(it) === 1

  return (
    !loading && (
      <>
        <TitleSection
          title="Cash-out"
          appendix={
            <HelpTooltip width={320}>
              <P>
                For details on configuring cash-out, please read the relevant
                knowledgebase article:
              </P>
              <SupportLinkButton
                link="https://support.lamassu.is/hc/en-us/articles/115003720192-Enabling-cash-out-on-the-admin"
                label="Enabling cash-out on the admin"
                bottomSpace="1"
              />
            </HelpTooltip>
          }
        />
        <EditableTable
          namespaces={R.map(R.path(['deviceId']))(machines)}
          data={config}
          stripeWhen={wasNeverEnabled}
          enableEdit
          editWidth={95}
          enableToggle
          toggleWidth={100}
          onToggle={onToggle}
          save={save}
          error={error?.message}
          validationSchema={DenominationsSchema}
          disableRowEdit={R.compose(R.not, R.path(['active']))}
          elements={getElements(machines, locale)}
        />
        {R.isEmpty(machines) && <EmptyTable message="No machines so far" />}
        {wizard && (
          <Wizard
            machine={R.find(R.propEq(wizard, 'deviceId'))(machines)}
            onClose={() => setWizard(false)}
            save={save}
            error={error?.message}
            locale={locale}
          />
        )}
      </>
    )
  )
}

export default CashOut
