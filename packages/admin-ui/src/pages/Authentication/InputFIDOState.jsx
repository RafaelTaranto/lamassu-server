import { useMutation, useLazyQuery, gql } from '@apollo/client'
import { startAssertion } from '@simplewebauthn/browser'
import { Field, Form, Formik } from 'formik'
import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { H2, Label2, P } from '../../components/typography'
import * as Yup from 'yup'

import AppContext from '../../AppContext'
import { Button } from '../../components/buttons'
import { Checkbox, TextInput } from '../../components/inputs/formik'

const GET_USER_DATA = gql`
  {
    userData {
      id
      username
      role
    }
  }
`

const validationSchema = Yup.object().shape({
  localClient: Yup.string()
    .required('Client field is required!')
    .email('Username field should be in an email format!'),
  localRememberMe: Yup.boolean(),
})

const initialValues = {
  localClient: '',
  localRememberMe: false,
}

const InputFIDOState = ({ state, strategy }) => {
  const GENERATE_ASSERTION = gql`
    query generateAssertionOptions($username: String!${
      strategy === 'FIDO2FA' ? `, $password: String!` : ``
    }, $domain: String!) {
      generateAssertionOptions(username: $username${
        strategy === 'FIDO2FA' ? `, password: $password` : ``
      }, domain: $domain)
    }
  `

  const VALIDATE_ASSERTION = gql`
    mutation validateAssertion(
      $username: String!
      ${strategy === 'FIDO2FA' ? `, $password: String!` : ``}
      $rememberMe: Boolean!
      $assertionResponse: JSONObject!
      $domain: String!
    ) {
      validateAssertion(
        username: $username
        ${strategy === 'FIDO2FA' ? `password: $password` : ``}
        rememberMe: $rememberMe
        assertionResponse: $assertionResponse
        domain: $domain
      )
    }
  `

  const history = useHistory()
  const { setUserData } = useContext(AppContext)

  const [localClientField, setLocalClientField] = useState('')
  const [localRememberMeField, setLocalRememberMeField] = useState(false)
  const [invalidUsername, setInvalidUsername] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  const [validateAssertion, { error: mutationError }] = useMutation(
    VALIDATE_ASSERTION,
    {
      onCompleted: ({ validateAssertion: success }) => {
        success ? getUserData() : setInvalidToken(true)
      },
    },
  )

  const [assertionOptions, { error: assertionQueryError }] = useLazyQuery(
    GENERATE_ASSERTION,
    {
      variables:
        strategy === 'FIDO2FA'
          ? {
              username: state.clientField,
              password: state.passwordField,
              domain: window.location.hostname,
            }
          : {
              username: localClientField,
              domain: window.location.hostname,
            },
      onCompleted: ({ generateAssertionOptions: options }) => {
        startAssertion(options)
          .then(res => {
            const variables =
              strategy === 'FIDO2FA'
                ? {
                    username: state.clientField,
                    password: state.passwordField,
                    rememberMe: state.rememberMeField,
                    assertionResponse: res,
                    domain: window.location.hostname,
                  }
                : {
                    username: localClientField,
                    rememberMe: localRememberMeField,
                    assertionResponse: res,
                    domain: window.location.hostname,
                  }
            validateAssertion({
              variables,
            })
          })
          .catch(err => {
            console.error(err)
            setInvalidToken(true)
          })
      },
    },
  )

  const [getUserData, { error: queryError }] = useLazyQuery(GET_USER_DATA, {
    onCompleted: ({ userData }) => {
      setUserData(userData)
      history.push('/')
    },
  })

  const getErrorMsg = (formikErrors, formikTouched) => {
    if (!formikErrors || !formikTouched) return null
    if (assertionQueryError || queryError || mutationError)
      return 'Internal server error'
    if (formikErrors.client && formikTouched.client) return formikErrors.client
    if (invalidUsername) return 'Invalid login.'
    if (invalidToken) return 'Code is invalid. Please try again.'
    return null
  }

  return (
    <>
      {strategy === 'FIDOPasswordless' && (
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={values => {
            setInvalidUsername(false)
            setLocalClientField(values.localClient)
            setLocalRememberMeField(values.localRememberMe)
            assertionOptions()
          }}>
          {({ errors, touched }) => (
            <Form id="fido-form">
              <Field
                name="localClient"
                label="Client"
                size="lg"
                component={TextInput}
                fullWidth
                autoFocus
                className="-mt-4 mb-6"
                error={getErrorMsg(errors, touched)}
                onKeyUp={() => {
                  if (invalidUsername) setInvalidUsername(false)
                }}
              />
              <div className="mt-9 flex">
                <Field
                  name="localRememberMe"
                  className="-ml-2 transform-[scale(1.5)]"
                  component={Checkbox}
                />
                <Label2>Keep me logged in</Label2>
              </div>
              <div className="mt-9">
                {getErrorMsg(errors, touched) && (
                  <P className="text-tomato">{getErrorMsg(errors, touched)}</P>
                )}
                <Button type="submit" form="fido-form" buttonClassName="w-full">
                  Use FIDO
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
      {strategy === 'FIDO2FA' && (
        <>
          <H2 className="mb-8">
            Insert your hardware key and follow the instructions
          </H2>
          <Button
            type="button"
            form="fido-form"
            onClick={() => assertionOptions()}
            buttonClassName="w-full">
            Use FIDO
          </Button>
        </>
      )}
    </>
  )
}

export default InputFIDOState
