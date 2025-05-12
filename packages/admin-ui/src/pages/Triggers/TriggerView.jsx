import { useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import { H2 } from 'src/components/typography'
import { v4 as uuidv4 } from 'uuid'

import { Button } from 'src/components/buttons'
import { Table as EditableTable } from 'src/components/editableTable'
import { fromNamespace, namespaces } from 'src/utils/config'

import Wizard from './Wizard'
import { Schema, getElements, sortBy, toServer } from './helper'

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const TriggerView = ({
  triggers,
  showWizard,
  config,
  toggleWizard,
  addNewTriger,
  emailAuth,
  complianceServices,
  customInfoRequests,
}) => {
  const currency = R.path(['fiatCurrency'])(
    fromNamespace(namespaces.LOCALE)(config),
  )
  const [error, setError] = useState(null)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: () => toggleWizard(true),
    refetchQueries: () => ['getData'],
    onError: error => setError(error),
  })

  const save = config => {
    setError(null)
    return saveConfig({
      variables: { config: { triggers: toServer(config.triggers) } },
    })
  }

  const add = rawConfig => {
    const toSave = R.concat([
      { id: uuidv4(), direction: 'both', ...rawConfig },
    ])(triggers)
    return saveConfig({ variables: { config: { triggers: toServer(toSave) } } })
  }

  return (
    <>
      <EditableTable
        data={triggers}
        name="triggers"
        enableEdit
        sortBy={sortBy}
        groupBy="triggerType"
        enableDelete
        error={error?.message}
        save={save}
        validationSchema={Schema}
        elements={getElements(currency, customInfoRequests)}
      />
      {showWizard && (
        <Wizard
          currency={currency}
          error={error?.message}
          save={add}
          onClose={() => toggleWizard(true)}
          customInfoRequests={customInfoRequests}
          complianceServices={complianceServices}
          emailAuth={emailAuth}
          triggers={triggers}
        />
      )}
      {R.isEmpty(triggers) && (
        <div className="flex items-center flex-col mt-30">
          <H2>
            It seems there are no active compliance triggers on your network
          </H2>
          <Button onClick={addNewTriger}>Add first trigger</Button>
        </div>
      )}
    </>
  )
}

export default TriggerView
