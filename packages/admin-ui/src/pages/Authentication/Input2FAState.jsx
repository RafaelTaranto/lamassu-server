import { useMutation, useLazyQuery, gql } from '@apollo/client'
import { Form, Formik } from 'formik'
import React, { useContext, useState } from 'react'
import { useLocation } from 'wouter'
import { TL1, P } from '../../components/typography'

import AppContext from '../../AppContext'
import { Button } from '../../components/buttons'
import { CodeInput } from '../../components/inputs/base'

import { STATES } from './states'

const INPUT_2FA = gql`
  mutation input2FA(
    $username: String!
    $password: String!
    $code: String!
    $rememberMe: Boolean!
  ) {
    input2FA(
      username: $username
      password: $password
      code: $code
      rememberMe: $rememberMe
    )
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

const Input2FAState = ({ state, dispatch }) => {
  const [, navigate] = useLocation()
  const { setUserData } = useContext(AppContext)

  const [invalidToken, setInvalidToken] = useState(false)

  const [getUserData, { error: queryError }] = useLazyQuery(GET_USER_DATA, {
    onCompleted: ({ userData }) => {
      setUserData(userData)
      navigate('/')
    },
  })

  const [input2FA, { error: mutationError }] = useMutation(INPUT_2FA, {
    onCompleted: ({ input2FA: success }) => {
      if (success) {
        return getUserData()
      }
      return setInvalidToken(true)
    },
  })

  const handle2FAChange = value => {
    dispatch({
      type: STATES.INPUT_2FA,
      payload: {
        twoFAField: value,
      },
    })
    setInvalidToken(false)
  }

  const handleSubmit = () => {
    if (state.twoFAField.length !== 6) {
      setInvalidToken(true)
      return
    }

    const options = {
      variables: {
        username: state.clientField,
        password: state.passwordField,
        code: state.twoFAField,
        rememberMe: state.rememberMeField,
      },
    }

    input2FA(options)
  }

  const getErrorMsg = () => {
    if (queryError) return 'Internal server error'
    if (state.twoFAField.length !== 6 && invalidToken)
      return 'The code should have 6 characters!'
    if (mutationError || invalidToken)
      return 'Code is invalid. Please try again.'
    return null
  }

  const errorMessage = getErrorMsg()

  return (
    <>
      <TL1 className="mb-8">Enter your two-factor authentication code</TL1>
      {/* TODO: refactor the 2FA CodeInput to properly use Formik */}
      <Formik onSubmit={() => {}} initialValues={{}}>
        <Form>
          <CodeInput
            name="2fa"
            value={state.twoFAField}
            onChange={handle2FAChange}
            numInputs={6}
            error={invalidToken}
          />
          <div className="mt-9">
            {errorMessage && <P className="text-tomato">{errorMessage}</P>}
            <Button onClick={handleSubmit} buttonClassName="w-full">
              Login
            </Button>
          </div>
        </Form>
      </Formik>
    </>
  )
}

export default Input2FAState
