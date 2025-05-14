import { useHistory, useLocation } from 'react-router-dom'
import React, { useContext, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import Slide from '@mui/material/Slide'
import Grid from '@mui/material/Grid'

import Header from './components/layout/Header.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import TitleSection from './components/layout/TitleSection.jsx'
import { getParent, hasSidebar, Routes, tree } from './routing/routes.jsx'
import Wizard from './pages/Wizard/Wizard.jsx'

import AppContext from './AppContext.js'

const GET_USER_DATA = gql`
  query userData {
    userData {
      id
      username
      role
      enabled
      last_accessed
      last_accessed_from
      last_accessed_address
    }
  }
`

const Main = () => {
  const location = useLocation()
  const history = useHistory()
  const { wizardTested, userData, setUserData } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useQuery(GET_USER_DATA, {
    onCompleted: userResponse => {
      if (!userData && userResponse?.userData) {
        setUserData(userResponse.userData)
      }
      setLoading(false)
    },
  })

  const route = location.pathname

  const sidebar = hasSidebar(route)
  const parent = sidebar ? getParent(route) : {}

  const is404 = location.pathname === '/404'

  const isSelected = it => location.pathname === it.route

  const onClick = it => history.push(it.route)

  const contentClassName = sidebar ? 'flex-1 ml-12 pt-4' : 'w-[1200px]'

  // Show loading state until userData is fetched
  if (loading) {
    return <></>
  }

  if (!wizardTested && !is404 && userData) {
    return <Wizard />
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      {!is404 && wizardTested && <Header tree={tree} user={userData} />}
      <main className="flex flex-1 flex-col my-0 mx-auto h-full w-[1200px]">
        {sidebar && !is404 && wizardTested && (
          <Slide direction="left" in={true} mountOnEnter unmountOnExit>
            <div>
              <TitleSection title={parent.title}></TitleSection>
            </div>
          </Slide>
        )}

        <Grid sx={{ flex: 1, height: 1 }} container>
          {sidebar && !is404 && wizardTested && (
            <Sidebar
              data={parent.children}
              isSelected={isSelected}
              displayName={it => it.label}
              onClick={onClick}
            />
          )}
          <div className={contentClassName}>
            <Routes />
          </div>
        </Grid>
      </main>
    </div>
  )
}

export default Main
