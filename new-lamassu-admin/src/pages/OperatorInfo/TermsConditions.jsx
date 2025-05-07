import { useQuery, useMutation, gql } from '@apollo/client'
import classnames from 'classnames'
import { Form, Formik, Field as FormikField } from 'formik'
import * as R from 'ramda'
import React, { useState } from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import PromptWhenDirty from 'src/components/PromptWhenDirty'
import { Info2, Info3, Label3 } from 'src/components/typography'
import EditIcon from 'src/styling/icons/action/edit/enabled.svg?react'
import * as Yup from 'yup'

import { Link, IconButton } from 'src/components/buttons'
import { TextInput } from 'src/components/inputs/formik'
import { fromNamespace, toNamespace, namespaces } from 'src/utils/config'

import Header from './components/Header.jsx'
import SwitchRow from './components/SwitchRow.jsx'

const Field = ({
  editing,
  name,
  width,
  placeholder,
  label,
  value,
  multiline = false,
  rows,
  onFocus,
  ...props
}) => {
  const info3ClassNames = {
    'overflow-hidden whitespace-nowrap text-ellipsis h-6': !multiline,
    'wrap-anywhere overflow-y-auto h-32 mt-4 leading-[23px]': multiline
  }

  return (
    <div className={`w-125 p-0 pl-1 pb-1`}>
      {!editing && (
        <>
          <Label3 noMargin className="h-4 text-[13px] my-[3px] mb-1">
            {label}
          </Label3>
          <Info3 noMargin className={classnames(info3ClassNames)}>
            {value}
          </Info3>
        </>
      )}
      {editing && (
        <FormikField
          id={name}
          name={name}
          component={TextInput}
          width={width}
          placeholder={placeholder}
          type="text"
          label={label}
          multiline={multiline}
          rows={rows}
          rowsMax="6"
          onFocus={onFocus}
          {...props}
        />
      )}
    </div>
  )
}

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

const TermsConditions = () => {
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: () => {
      setError(null)
      setEditing(false)
    },
    refetchQueries: () => ['getData'],
    onError: e => setError(e)
  })

  const { data } = useQuery(GET_CONFIG)

  const termsAndConditions =
    data?.config && fromNamespace(namespaces.TERMS_CONDITIONS, data.config)
  const formData = termsAndConditions ?? {}
  const showOnScreen = termsAndConditions?.active ?? false
  const addDelayOnScreen = termsAndConditions?.delay ?? false
  const tcPhoto = termsAndConditions?.tcPhoto ?? false

  const save = it =>
    saveConfig({
      variables: { config: toNamespace(namespaces.TERMS_CONDITIONS, it) }
    })

  const fields = [
    {
      name: 'title',
      label: 'Screen title',
      value: formData.title ?? '',
      width: 282
    },
    {
      name: 'text',
      label: 'Text content',
      value: formData.text ?? '',
      width: 502,
      multiline: true,
      rows: 6
    },
    {
      name: 'acceptButtonText',
      label: 'Accept button text',
      value: formData.acceptButtonText ?? '',
      placeholder: 'I accept',
      width: 282
    },
    {
      name: 'cancelButtonText',
      label: 'Cancel button text',
      value: formData.cancelButtonText ?? '',
      placeholder: 'Cancel',
      width: 282
    }
  ]

  const findField = name => R.find(R.propEq('name', name))(fields)
  const findValue = name => findField(name).value

  const initialValues = {
    title: findValue('title'),
    text: findValue('text'),
    acceptButtonText: findValue('acceptButtonText'),
    cancelButtonText: findValue('cancelButtonText')
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string('The screen title must be a string')
      .required('The screen title is required')
      .max(50, 'Too long'),
    text: Yup.string('The text content must be a string').required(
      'The text content is required'
    ),
    acceptButtonText: Yup.string('The accept button text must be a string')
      .required('The accept button text is required')
      .max(50, 'The accept button text is too long'),
    cancelButtonText: Yup.string('The cancel button text must be a string')
      .required('The cancel button text is required')
      .max(50, 'The cancel button text is too long')
  })

  return (
    <>
      <Header
        title="Terms & Conditions"
        tooltipText="For details on configuring this panel, please read the relevant knowledgebase article:"
        articleUrl="https://support.lamassu.is/hc/en-us/articles/360015982211-Terms-and-Conditions"
      />
      <SwitchRow
        title="Show on screen"
        checked={showOnScreen}
        save={it => save({ active: it })}
      />
      <SwitchRow
        title="Capture customer photo on acceptance of Terms & Conditions"
        checked={tcPhoto}
        save={it => save({ tcPhoto: it })}
      />
      <SwitchRow
        title="Add 7 seconds delay on screen"
        checked={addDelayOnScreen}
        save={it => save({ delay: it })}
      />
      <div className="flex gap-3">
        <Info2>Info card</Info2>
        {!editing && (
          <IconButton onClick={() => setEditing(true)} size="large">
            <EditIcon />
          </IconButton>
        )}
      </div>
      <Formik
        validateOnBlur={false}
        validateOnChange={false}
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => save(values)}
        onReset={() => {
          setEditing(false)
          setError(null)
        }}>
        {({ errors }) => (
          <Form className="flex flex-col gap-6">
            <PromptWhenDirty />
            {fields.map((f, idx) => (
              <div className="flex gap-7" key={idx}>
                <Field
                  editing={editing}
                  name={f.name}
                  width={f.width}
                  placeholder={f.placeholder}
                  label={f.label}
                  value={f.value}
                  multiline={f.multiline}
                  rows={f.rows}
                  onFocus={() => setError(null)}
                />
              </div>
            ))}
            <div className="flex gap-10">
              {editing && (
                <>
                  <Link color="primary" type="submit">
                    Save
                  </Link>
                  <Link color="secondary" type="reset">
                    Cancel
                  </Link>
                  {!R.isEmpty(errors) && (
                    <ErrorMessage>{R.head(R.values(errors))}</ErrorMessage>
                  )}
                  {error && <ErrorMessage>Failed to save changes</ErrorMessage>}
                </>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default TermsConditions
