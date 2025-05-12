import Paper from '@mui/material/Paper'
import React, { useReducer } from 'react'
import Logo from 'src/styling/icons/menu/logo.svg?react'

import Input2FAState from './Input2FAState'
import InputFIDOState from './InputFIDOState'
import LoginState from './LoginState'
import Setup2FAState from './Setup2FAState'
import { STATES } from './states'
import classes from './Authentication.module.css'

// FIDO2FA, FIDOPasswordless or FIDOUsernameless
const AUTHENTICATION_STRATEGY = 'FIDO2FA'

const initialState = {
  twoFAField: '',
  clientField: '',
  passwordField: '',
  rememberMeField: false,
  loginState: STATES.LOGIN,
}

const reducer = (state, action) => {
  const { type, payload } = action
  return { ...state, ...payload, loginState: type }
}

const LoginCard = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const renderState = () => {
    switch (state.loginState) {
      case STATES.LOGIN:
        return (
          <LoginState
            state={state}
            dispatch={dispatch}
            strategy={AUTHENTICATION_STRATEGY}
          />
        )
      case STATES.INPUT_2FA:
        return <Input2FAState state={state} dispatch={dispatch} />
      case STATES.SETUP_2FA:
        return <Setup2FAState state={state} dispatch={dispatch} />
      case STATES.FIDO:
        return (
          <InputFIDOState state={state} strategy={AUTHENTICATION_STRATEGY} />
        )
      default:
        break
    }
  }

  return (
    <Paper elevation={1}>
      <div className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Logo className={classes.icon} />
          <h3 className={classes.title}>Lamassu Admin</h3>
        </div>
        {renderState()}
      </div>
    </Paper>
  )
}

export default LoginCard
