import { useMutation, useLazyQuery, gql } from '@apollo/client'
import { startAssertion } from '@simplewebauthn/browser'
import { Field, Form, Formik } from 'formik'
import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Label3, P } from '../../components/typography'
import * as Yup from 'yup'

import AppContext from '../../AppContext'
import { Button } from '../../components/buttons'
import {
  Checkbox,
  SecretInput,
  TextInput,
} from '../../components/inputs/formik'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`

const GENERATE_ASSERTION = gql`
  query generateAssertionOptions($domain: String!) {
    generateAssertionOptions(domain: $domain)
  }
`

const VALIDATE_ASSERTION = gql`
  mutation validateAssertion(
    $assertionResponse: JSONObject!
    $domain: String!
  ) {
    validateAssertion(assertionResponse: $assertionResponse, domain: $domain)
  }
`

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
  email: Yup.string().label('Email').required().email(),
  password: Yup.string().required('Password field is required'),
  rememberMe: Yup.boolean(),
})

const initialValues = {
  email: '',
  password: '',
  rememberMe: false,
}

const getErrorMsg = (formikErrors, formikTouched, mutationError) => {
  if (!formikErrors || !formikTouched) return null
  if (mutationError) return 'Invalid email/password combination'
  if (formikErrors.email && formikTouched.email) return formikErrors.email
  if (formikErrors.password && formikTouched.password)
    return formikErrors.password
  return null
}

const LoginState = ({ dispatch, strategy }) => {
  const history = useHistory()
  const { setUserData } = useContext(AppContext)

  const [login, { error: loginMutationError }] = useMutation(LOGIN)

  const submitLogin = async (username, password, rememberMe) => {
    const options = {
      variables: {
        username,
        password,
      },
    }
    const { data: loginResponse } = await login(options)

    if (!loginResponse.login) return

    return dispatch({
      type: loginResponse.login,
      payload: {
        clientField: username,
        passwordField: password,
        rememberMeField: rememberMe,
      },
    })
  }

  const [validateAssertion, { error: FIDOMutationError }] = useMutation(
    VALIDATE_ASSERTION,
    {
      onCompleted: ({ validateAssertion: success }) => success && getUserData(),
    },
  )

  const [assertionOptions, { error: assertionQueryError }] = useLazyQuery(
    GENERATE_ASSERTION,
    {
      onCompleted: ({ generateAssertionOptions: options }) => {
        startAssertion(options)
          .then(res => {
            validateAssertion({
              variables: {
                assertionResponse: res,
                domain: window.location.hostname,
              },
            })
          })
          .catch(err => {
            console.error(err)
          })
      },
    },
  )

  const [getUserData, { error: userDataQueryError }] = useLazyQuery(
    GET_USER_DATA,
    {
      onCompleted: ({ userData }) => {
        setUserData(userData)
        history.push('/')
      },
    },
  )

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={values =>
        submitLogin(values.email, values.password, values.rememberMe)
      }>
      {({ errors, touched }) => (
        <Form id="login-form">
          <Field
            name="email"
            label="Email"
            size="lg"
            component={TextInput}
            fullWidth
            autoFocus
            className="-mt-4 mb-6"
            error={getErrorMsg(
              errors,
              touched,
              loginMutationError ||
                FIDOMutationError ||
                assertionQueryError ||
                userDataQueryError,
            )}
          />
          <Field
            name="password"
            size="lg"
            component={SecretInput}
            label="Password"
            fullWidth
            error={getErrorMsg(
              errors,
              touched,
              loginMutationError ||
                FIDOMutationError ||
                assertionQueryError ||
                userDataQueryError,
            )}
          />
          <div className="mt-9 flex">
            <Field
              name="rememberMe"
              className="-ml-2 transform-[scale(1.5)]"
              component={Checkbox}
              size="medium"
            />
            <Label3>Keep me logged in</Label3>
          </div>
          <div className="mt-15">
            {getErrorMsg(
              errors,
              touched,
              loginMutationError ||
                FIDOMutationError ||
                assertionQueryError ||
                userDataQueryError,
            ) && (
              <P className="text-tomato">
                {getErrorMsg(
                  errors,
                  touched,
                  loginMutationError ||
                    FIDOMutationError ||
                    assertionQueryError ||
                    userDataQueryError,
                )}
              </P>
            )}
            {strategy !== 'FIDO2FA' && (
              <Button
                type="button"
                onClick={() => {
                  return strategy === 'FIDOUsernameless'
                    ? assertionOptions({
                        variables: { domain: window.location.hostname },
                      })
                    : dispatch({
                        type: 'FIDO',
                        payload: {},
                      })
                }}
                buttonClassName="w-full"
                className="mb-3">
                I have a hardware key
              </Button>
            )}
            <Button type="submit" form="login-form" buttonClassName="w-full">
              Login
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default LoginState
