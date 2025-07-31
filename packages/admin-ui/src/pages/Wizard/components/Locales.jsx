import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React from 'react'
import Section from '../../../components/layout/Section'
import TitleSection from '../../../components/layout/TitleSection'

import { Table as EditableTable } from '../../../components/editableTable'
import {
  mainFields,
  localeDefaults as defaults,
  LocaleSchema as schema,
} from '../../Locales/helper'
import { toNamespace } from '../../../utils/config'

import { getConfiguredCoins } from '../helper'

const GET_DATA = gql`
  query getData {
    configWithAllTriggers
    accounts
    currencies {
      code
      display
    }
    countries {
      code
      display
    }
    cryptoCurrencies {
      code
      display
    }
    languages {
      code
      display
    }
    machines {
      name
      deviceId
    }
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

function Locales({ isActive, doContinue }) {
  const { data } = useQuery(GET_DATA)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: doContinue,
  })

  const save = it => {
    const config = toNamespace('locale')(it.locale[0])
    return saveConfig({ variables: { config } })
  }

  const cryptoCurrencies = getConfiguredCoins(
    data?.configWithAllTriggers || {},
    data?.cryptoCurrencies || [],
  )

  const onChangeCoin = (prev, curr, setValue) => setValue(curr)

  return (
    <div className="w-[1132px] h-full mx-auto flex-1 flex flex-col">
      <TitleSection title="Locales" />
      <Section>
        <EditableTable
          title="Default settings"
          rowSize="lg"
          titleLg
          name="locale"
          initialValues={defaults}
          forceAdd={isActive}
          enableEdit
          save={save}
          validationSchema={schema}
          data={[]}
          elements={mainFields(
            R.mergeRight(data, { cryptoCurrencies }),
            onChangeCoin,
          )}
        />
      </Section>
    </div>
  )
}

export default Locales
