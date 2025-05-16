import React, { useContext } from 'react'
import { Route, Redirect } from 'wouter'

import AppContext from '../AppContext'

import { isLoggedIn } from './utils'

const PublicRoute = ({ restricted, ...rest }) => {
  const { userData } = useContext(AppContext)

  return isLoggedIn(userData) && restricted ? (
    <Redirect to="/" />
  ) : (
    <Route {...rest} />
  )
}

export default PublicRoute
