import { useMutation, gql } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import ErrorMessage from '../../../components/ErrorMessage'
import Modal from '../../../components/Modal'
import { Info2, P, Mono } from '../../../components/typography'
import CopyToClipboard from '../../../components/CopyToClipboard.jsx'

import { urlResolver } from '../../../utils/urlResolver'

import Input2FAModal from './Input2FAModal'
import classes from '../UserManagement.module.css'

const CREATE_RESET_PASSWORD_TOKEN = gql`
  mutation createResetPasswordToken($confirmationCode: String, $userID: ID!) {
    createResetPasswordToken(
      confirmationCode: $confirmationCode
      userID: $userID
    ) {
      token
      user_id
      expire
    }
  }
`

const ResetPasswordModal = ({
  state,
  dispatch,
  user,
  requiresConfirmation,
}) => {
  const [resetPasswordUrl, setResetPasswordUrl] = useState('')

  const [createResetPasswordToken, { loading, error }] = useMutation(
    CREATE_RESET_PASSWORD_TOKEN,
    {
      onCompleted: ({ createResetPasswordToken: token }) => {
        setResetPasswordUrl(urlResolver(`/resetpassword?t=${token.token}`))
      },
    },
  )

  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    state.showResetPasswordModal &&
      (confirmation || !requiresConfirmation) &&
      createResetPasswordToken({
        variables: {
          confirmationCode: confirmation,
          userID: user?.id,
        },
      })
  }, [
    confirmation,
    createResetPasswordToken,
    requiresConfirmation,
    state.showResetPasswordModal,
    user?.id,
  ])

  const handleClose = () => {
    setConfirmation(null)
    dispatch({
      type: 'close',
      payload: 'showResetPasswordModal',
    })
  }

  return (
    (state.showResetPasswordModal && requiresConfirmation && !confirmation && (
      <Input2FAModal
        showModal={state.showResetPasswordModal}
        handleClose={handleClose}
        setConfirmation={setConfirmation}
      />
    )) ||
    (state.showResetPasswordModal &&
      (confirmation || !requiresConfirmation) &&
      !loading && (
        <Modal
          closeOnBackdropClick={true}
          width={500}
          height={180}
          handleClose={handleClose}
          open={true}>
          <Info2 className={classes.modalTitle}>
            Reset password for {user.username}
          </Info2>
          <P className={classes.info}>
            Safely share this link with {user.username} for a password reset.
          </P>
          {!error && (
            <div className={classes.addressWrapper}>
              <Mono className={classes.address}>
                <strong>
                  <CopyToClipboard
                    className={classes.link}
                    buttonClassname={classes.copyToClipboard}
                    wrapperClassname={classes.linkWrapper}>
                    {resetPasswordUrl}
                  </CopyToClipboard>
                </strong>
              </Mono>
            </div>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Modal>
      ))
  )
}

export default ResetPasswordModal
