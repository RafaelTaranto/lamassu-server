import IconButton from '@mui/material/IconButton'
import { useQuery, useMutation, gql } from '@apollo/client'
import { Form, Formik, Field as FormikField } from 'formik'
import * as R from 'ramda'
import React, { useState } from 'react'
import ErrorMessage from '../../components/ErrorMessage'
import PromptWhenDirty from '../../components/PromptWhenDirty'
import { H4, Info3, Label3 } from '../../components/typography'
import EditIcon from '../../styling/icons/action/edit/enabled.svg?react'
import WarningIcon from '../../styling/icons/warning-icon/comet.svg?react'
import * as Yup from 'yup'

import { Link } from '../../components/buttons'
import { TextInput } from '../../components/inputs/formik'
import { fromNamespace, toNamespace, namespaces } from '../../utils/config'

import SwitchRow from './components/SwitchRow.jsx'
import InfoMessage from './components/InfoMessage.jsx'
import Header from './components/Header.jsx'
import SvgIcon from '@mui/material/SvgIcon'

const FIELD_WIDTH = 280

const Field = ({ editing, field, displayValue, ...props }) => {
  return (
    <div className="w-70 h-12 p-0 pl-1 pb-1">
      {!editing && (
        <>
          <Label3 noMargin className="h-4 text-[13px] my-[3px]">
            {field.label}
          </Label3>
          <Info3
            noMargin
            className="overflow-hidden whitespace-nowrap text-ellipsis">
            {displayValue(field.value)}
          </Info3>
        </>
      )}
      {editing && (
        <FormikField
          id={field.name}
          name={field.name}
          component={field.component}
          placeholder={field.placeholder}
          type={field.type}
          label={field.label}
          width={FIELD_WIDTH}
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

const ContactInfo = ({ wizard }) => {
  const [editing, setEditing] = useState(wizard || false)
  const [error, setError] = useState(null)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: () => setEditing(false),
    refetchQueries: () => ['getData'],
    onError: e => setError(e),
  })

  const { data } = useQuery(GET_CONFIG)

  const save = it => {
    return saveConfig({
      variables: { config: toNamespace(namespaces.OPERATOR_INFO, it) },
    })
  }

  const info =
    data?.config && fromNamespace(namespaces.OPERATOR_INFO, data.config)

  if (!info) return null

  const validationSchema = Yup.object().shape({
    active: Yup.boolean(),
    name: Yup.string(),
    phone: Yup.string(),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('An email is required'),
    website: Yup.string(),
    companyNumber: Yup.string(),
  })

  const fields = [
    {
      name: 'name',
      label: 'Company name',
      value: info.name ?? '',
      component: TextInput,
    },
    {
      name: 'phone',
      label: 'Phone number',
      value: info.phone,
      component: TextInput,
    },
    {
      name: 'email',
      label: 'Email',
      value: info.email ?? '',
      component: TextInput,
    },
    {
      name: 'website',
      label: 'Website',
      value: info.website ?? '',
      component: TextInput,
    },
    {
      name: 'companyNumber',
      label: 'Company registration number',
      value: info.companyNumber ?? '',
      component: TextInput,
    },
  ]

  const findField = name => R.find(R.propEq(name, 'name'))(fields)
  const findValue = name => findField(name).value

  const displayTextValue = value => value

  const form = {
    initialValues: {
      active: info.active,
      name: findValue('name'),
      phone: findValue('phone'),
      email: findValue('email'),
      website: findValue('website'),
      companyNumber: findValue('companyNumber'),
    },
  }

  const getErrorMsg = formikErrors =>
    !R.isNil(formikErrors.email) ? formikErrors.email : null

  return (
    <>
      <Header
        title="Contact information"
        articleUrl="https://support.lamassu.is/hc/en-us/articles/360033051732-Enabling-Operator-Info"
        tooltipText="For details on configuring this panel, please read the relevant knowledgebase article:"
      />
      <SwitchRow checked={info.active} save={save} title="Info card enabled?" />
      <div>
        <div className="flex items-center gap-4">
          <H4>Info card</H4>
          {!editing && (
            <IconButton onClick={() => setEditing(true)}>
              <SvgIcon>
                <EditIcon />
              </SvgIcon>
            </IconButton>
          )}
        </div>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize
          initialValues={form.initialValues}
          validationSchema={validationSchema}
          onSubmit={values => save(validationSchema.cast(values))}
          onReset={() => {
            setEditing(false)
            setError(null)
          }}>
          {({ errors }) => (
            <Form className="flex flex-col gap-7 w-147">
              <PromptWhenDirty />
              <div className="flex gap-6 justify-between">
                <Field
                  field={findField('name')}
                  editing={editing}
                  displayValue={displayTextValue}
                  onFocus={() => setError(null)}
                />
                <Field
                  field={findField('phone')}
                  editing={editing}
                  displayValue={displayTextValue}
                  onFocus={() => setError(null)}
                />
              </div>
              <div className="flex gap-6">
                <Field
                  field={findField('email')}
                  editing={editing}
                  displayValue={displayTextValue}
                  onFocus={() => setError(null)}
                />
                <Field
                  field={findField('website')}
                  editing={editing}
                  displayValue={displayTextValue}
                  onFocus={() => setError(null)}
                />
              </div>
              <div className="flex gap-6">
                <Field
                  field={findField('companyNumber')}
                  editing={editing}
                  displayValue={displayTextValue}
                  onFocus={() => setError(null)}
                />
              </div>
              {editing && !!getErrorMsg(errors) && (
                <ErrorMessage>{getErrorMsg(errors)}</ErrorMessage>
              )}
              {editing && (
                <div className="flex gap-10">
                  <Link color="primary" type="submit">
                    Save
                  </Link>
                  <Link color="secondary" type="reset">
                    Cancel
                  </Link>
                  {error && <ErrorMessage>Failed to save changes</ErrorMessage>}
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
      {!wizard && (
        <>
          <InfoMessage Icon={WarningIcon}>
            Sharing your information with your customers through your machines
            allows them to contact you in case there's a problem with a machine
            in your network or a transaction.
          </InfoMessage>
        </>
      )}
    </>
  )
}

export default ContactInfo
