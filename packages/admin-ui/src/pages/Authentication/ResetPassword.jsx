import { useQuery, useMutation, gql } from '@apollo/client'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { useLocation, useSearchParams } from 'wouter'
import { H2, Label3, P } from '../../components/typography'
import Logo from '../../styling/icons/menu/logo.svg?react'
import * as Yup from 'yup'

import { Button } from '../../components/buttons'
import { SecretInput } from '../../components/inputs/formik'

import classes from './Authentication.module.css'

const VALIDATE_RESET_PASSWORD_LINK = gql`
  query validateResetPasswordLink($token: String!) {
    validateResetPasswordLink(token: $token) {
      id
    }
  }
`

const RESET_PASSWORD = gql`
  mutation resetPassword($token: String!, $userID: ID!, $newPassword: String!) {
    resetPassword(token: $token, userID: $userID, newPassword: $newPassword)
  }
`

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('A new password is required')
    .test(
      'len',
      'New password must contain more than 8 characters',
      val => val.length >= 8,
    ),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match',
  ),
})

const initialValues = {
  password: '',
  confirmPassword: '',
}

const getErrorMsg = (formikErrors, formikTouched, mutationError) => {
  if (!formikErrors || !formikTouched) return null
  if (mutationError) return 'Internal server error'
  if (formikErrors.password && formikTouched.password)
    return formikErrors.password
  if (formikErrors.confirmPassword && formikTouched.confirmPassword)
    return formikErrors.confirmPassword
  return null
}

const ResetPassword = () => {
  const [, navigate] = useLocation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const [userID, setUserID] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [wasSuccessful, setSuccess] = useState(false)

  useQuery(VALIDATE_RESET_PASSWORD_LINK, {
    variables: { token: token },
    onCompleted: ({ validateResetPasswordLink: info }) => {
      setLoading(false)
      if (!info) {
        setSuccess(false)
      } else {
        setSuccess(true)
        setUserID(info.id)
      }
    },
    onError: () => {
      setLoading(false)
      setSuccess(false)
    },
  })

  const [resetPassword, { error }] = useMutation(RESET_PASSWORD, {
    onCompleted: ({ resetPassword: success }) => {
      if (success) navigate('/')
    },
  })

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.welcomeBackground}>
      <Grid>
        <div>
          <Paper elevation={1}>
            <div className={classes.wrapper}>
              <div className={classes.titleWrapper}>
                <Logo className={classes.icon} />
                <H2 className={classes.title}>Lamassu Admin</H2>
              </div>
              {!isLoading && wasSuccessful && (
                <Formik
                  validationSchema={validationSchema}
                  initialValues={initialValues}
                  onSubmit={values => {
                    resetPassword({
                      variables: {
                        token: token,
                        userID: userID,
                        newPassword: values.confirmPassword,
                      },
                    })
                  }}>
                  {({ errors, touched }) => (
                    <Form id="reset-password">
                      <Field
                        name="password"
                        autoFocus
                        size="lg"
                        component={SecretInput}
                        label="New password"
                        fullWidth
                        className="-mt-4 mb-6"
                      />
                      <Field
                        name="confirmPassword"
                        size="lg"
                        component={SecretInput}
                        label="Confirm your password"
                        fullWidth
                      />
                      <div className="mt-15">
                        {getErrorMsg(errors, touched, error) && (
                          <P className="text-tomato">
                            {getErrorMsg(errors, touched, error)}
                          </P>
                        )}
                        <Button
                          type="submit"
                          form="reset-password"
                          buttonClassName="w-full">
                          Done
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
              {!isLoading && !wasSuccessful && (
                <>
                  <Label3>Link has expired</Label3>
                </>
              )}
            </div>
          </Paper>
        </div>
      </Grid>
    </Grid>
  )
}

export default ResetPassword
