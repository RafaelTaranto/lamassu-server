import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React from 'react'
import Section from 'src/components/layout/Section'
import TitleSection from 'src/components/layout/TitleSection'
import { mainFields, defaults, getSchema } from 'src/pages/Commissions/helper'

import { Table as EditableTable } from 'src/components/editableTable'
import { fromNamespace, toNamespace, namespaces } from 'src/utils/config'

const GET_DATA = gql`
  query getData {
    config
  }
`
const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

function Commissions({ isActive, doContinue }) {
  const { data } = useQuery(GET_DATA)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: doContinue
  })

  const save = it => {
    const config = toNamespace('commissions')(it.commissions[0])
    return saveConfig({ variables: { config } })
  }

  const currency = R.path(['fiatCurrency'])(
    fromNamespace(namespaces.LOCALE)(data?.config)
  )

  const locale = fromNamespace(namespaces.LOCALE)(data?.config)

  return (
    <div className="w-[1132px] h-full mx-auto flex-1 flex flex-col">
      <TitleSection title="Commissions" />
      <Section>
        <EditableTable
          title="Default setup"
          rowSize="lg"
          titleLg
          name="commissions"
          initialValues={defaults}
          enableEdit
          forceAdd={isActive}
          save={save}
          validationSchema={getSchema(locale)}
          data={[]}
          elements={mainFields(currency)}
        />
      </Section>
    </div>
  )
}

export default Commissions
