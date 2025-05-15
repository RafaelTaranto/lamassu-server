import Fade from '@mui/material/Fade'
import Slide from '@mui/material/Slide'
import * as R from 'ramda'
import React, { useContext } from 'react'
import { Redirect, Switch, useLocation } from 'wouter'
import Login from '../pages/Authentication/Login'
import Register from '../pages/Authentication/Register'
import Reset2FA from '../pages/Authentication/Reset2FA'
import ResetPassword from '../pages/Authentication/ResetPassword'

import AppContext from '../AppContext'
import Dashboard from '../pages/Dashboard'
import Machines from '../pages/Machines'

import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import getLamassuRoutes from './lamassu.routes'

const wrapperClasses = 'flex flex-1 flex-col h-full'

const tree = getLamassuRoutes()

const map = R.map(R.when(R.has('children'), R.prop('children')))
const mappedRoutes = R.compose(R.flatten, map)(tree)
const parentRoutes = R.filter(R.has('children'))(mappedRoutes).concat(
  R.filter(R.has('children'))(tree),
)
const leafRoutes = R.compose(R.flatten, map)(mappedRoutes)

const flattened = R.concat(leafRoutes, parentRoutes)

const hasSidebar = route =>
  R.any(r => r.route === route)(
    R.compose(
      R.flatten,
      R.map(R.prop('children')),
      R.filter(R.has('children')),
    )(mappedRoutes),
  )

const getParent = route =>
  R.find(
    R.propEq(
      'route',
      R.dropLast(
        1,
        R.dropLastWhile(x => x !== '/', route),
      ),
    ),
  )(flattened)

const Routes = () => {
  const [location] = useLocation()
  const { userData } = useContext(AppContext)

  const getFilteredRoutes = () => {
    // return all to prevent the user from being stuck at a 404 page
    if (!userData) return flattened

    return flattened.filter(value => {
      const keys = value.allowedRoles
      return R.includes(userData.role, keys)
    })
  }

  const Transition = history.state ? Slide : Fade

  const transitionProps =
    Transition === Slide
      ? {
          direction:
            R.findIndex(R.propEq('route', history.state.prev))(leafRoutes) >
            R.findIndex(R.propEq('route', location))(leafRoutes)
              ? 'right'
              : 'left',
        }
      : { timeout: 400 }

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <Redirect to="/dashboard" />
      </PrivateRoute>
      <PrivateRoute path="/dashboard">
        <Transition
          className={wrapperClasses}
          {...transitionProps}
          in={true}
          mountOnEnter
          unmountOnExit>
          <div className={wrapperClasses}>
            <Dashboard />
          </div>
        </Transition>
      </PrivateRoute>
      <PrivateRoute path="/machines">
        <Machines />
      </PrivateRoute>
      <PublicRoute path="/register" component={Register} />
      <PublicRoute path="/resetpassword" component={ResetPassword} />
      <PublicRoute path="/reset2fa" component={Reset2FA} />
      <PublicRoute path="/login" restricted component={Login} />
      {getFilteredRoutes().map(({ route, component: Page, key }) => (
        <PrivateRoute path={route} key={key}>
          <Transition
            className={wrapperClasses}
            {...transitionProps}
            in={location === route}
            mountOnEnter
            unmountOnExit>
            <div className={wrapperClasses}>
              <Page name={key} />
            </div>
          </Transition>
        </PrivateRoute>
      ))}
      <PublicRoute path="/404" />
      <PublicRoute path="*">
        <Redirect to="/404" />
      </PublicRoute>
    </Switch>
  )
}
export { tree, getParent, hasSidebar, Routes }
