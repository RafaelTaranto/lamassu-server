import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import React, { useState } from 'react'
import { Router } from 'wouter'
import ApolloProvider from './utils/apollo'

import AppContext from './AppContext'
import theme from './styling/theme'

import Main from './Main'
import './styling/global/global.css'
import useLocationWithConfirmation from './routing/useLocationWithConfirmation.js'

const App = () => {
  const [wizardTested, setWizardTested] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isDirtyForm, setDirtyForm] = useState(false)

  const setRole = role => {
    if (userData && role && userData.role !== role) {
      setUserData({ ...userData, role })
    }
  }

  return (
    <AppContext.Provider
      value={{
        wizardTested,
        setWizardTested,
        userData,
        setUserData,
        setRole,
        isDirtyForm,
        setDirtyForm,
      }}>
      <Router hook={useLocationWithConfirmation}>
        <ApolloProvider>
          <StyledEngineProvider enableCssLayer>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Main />
            </ThemeProvider>
          </StyledEngineProvider>
        </ApolloProvider>
      </Router>
    </AppContext.Provider>
  )
}

export default App
