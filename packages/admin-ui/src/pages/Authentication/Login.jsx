import Grid from '@mui/material/Grid'
import React from 'react'

import LoginCard from './LoginCard'
import classes from './Authentication.module.css'

const Login = () => {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.welcomeBackground}>
      <Grid>
        <LoginCard />
      </Grid>
    </Grid>
  )
}

export default Login
