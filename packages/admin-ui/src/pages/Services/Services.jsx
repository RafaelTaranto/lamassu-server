import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import Modal from '../../components/Modal'
import CheckboxInput from '../../components/inputs/formik/Checkbox'
import TitleSection from '../../components/layout/TitleSection'
import SingleRowTable from '../../components/single-row-table/SingleRowTable'

import { SecretInput } from '../../components/inputs/formik'
import { formatLong } from '../../utils/string'

import FormRenderer from './FormRenderer'
import _schemas from './schemas'

const GET_INFO = gql`
  query getData {
    accounts
    configWithAllTriggers
  }
`

const GET_MARKETS = gql`
  query getMarkets {
    getMarkets
  }
`

const SAVE_ACCOUNT = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const Services = () => {
  const [editingSchema, setEditingSchema] = useState(null)

  const { data, loading: configLoading } = useQuery(GET_INFO)
  const { data: marketsData, loading: marketsLoading } = useQuery(GET_MARKETS)
  const [saveAccount] = useMutation(SAVE_ACCOUNT, {
    onCompleted: () => setEditingSchema(null),
    refetchQueries: ['getData'],
  })

  const markets = marketsData?.getMarkets

  const schemas = _schemas(markets)

  const accounts = data?.accounts ?? {}

  const getItems = (code, elements) => {
    const faceElements = R.filter(R.prop('face'))(elements)
    const values = accounts[code] || {}
    return R.map(({ display, code, long }) => ({
      label: display,
      value: long ? formatLong(values[code]) : values[code],
    }))(faceElements)
  }

  const updateSettings = element => {
    const settings = element.settings
    const field = R.lensPath(['configWithAllTriggers', settings.field])
    const isEnabled = R.isNil(settings.requirement)
      ? true
      : R.equals(R.view(field, data), settings.requirement)
    settings.enabled = isEnabled
    return element
  }

  const getElements = ({ code, elements }) => {
    return R.map(elem => {
      if (elem.component === CheckboxInput) return updateSettings(elem)
      if (elem.component !== SecretInput) return elem
      return {
        ...elem,
        inputProps: {
          isPasswordFilled:
            !R.isNil(accounts[code]) &&
            !R.isNil(R.path([elem.code], accounts[code])),
        },
      }
    }, elements)
  }

  const getAccounts = ({ elements, code }) => {
    const account = accounts[code]
    const filterBySecretComponent = R.filter(R.propEq(SecretInput, 'component'))
    const mapToCode = R.map(R.prop(['code']))
    const passwordFields = R.compose(
      mapToCode,
      filterBySecretComponent,
    )(elements)
    return R.mapObjIndexed(
      (value, key) => (R.includes(key, passwordFields) ? '' : value),
      account,
    )
  }

  const getValidationSchema = ({ code, getValidationSchema }) =>
    getValidationSchema(accounts[code])

  const loading = marketsLoading || configLoading

  return (
    !loading && (
      <div>
        <TitleSection title="Third-Party services" />
        <div className="grid grid-cols-3 gap-5">
          {R.values(schemas).map(schema => (
            <SingleRowTable
              key={schema.code}
              editMessage={'Configure ' + schema.title}
              title={schema.title}
              onEdit={() => setEditingSchema(schema)}
              items={getItems(schema.code, schema.elements)}
            />
          ))}
        </div>
        {editingSchema && (
          <Modal
            title={`Edit ${editingSchema.name}`}
            width={525}
            handleClose={() => setEditingSchema(null)}
            open={true}>
            <FormRenderer
              save={it =>
                saveAccount({
                  variables: { accounts: { [editingSchema.code]: it } },
                })
              }
              elements={getElements(editingSchema)}
              validationSchema={getValidationSchema(editingSchema)}
              value={getAccounts(editingSchema)}
            />
          </Modal>
        )}
      </div>
    )
  )
}

export default Services
