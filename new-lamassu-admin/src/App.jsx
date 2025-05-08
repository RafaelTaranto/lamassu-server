import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import ApolloProvider from 'src/utils/apollo'

import AppContext from 'src/AppContext'
import theme from 'src/styling/theme'

import Main from './Main'
import './styling/global/global.css'

const App = () => {
  const [wizardTested, setWizardTested] = useState(false)
  const [userData, setUserData] = useState(null)

  const setRole = role => {
    if (userData && role && userData.role !== role) {
      setUserData({ ...userData, role })
    }
  }

  return (
    <AppContext.Provider
      value={{ wizardTested, setWizardTested, userData, setUserData, setRole }}>
      <Router>
        <ApolloProvider>
          <StyledEngineProvider injectFirst>
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
