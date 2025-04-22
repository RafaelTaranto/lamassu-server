import Grid from '@mui/material/Grid'
import { makeStyles } from '@mui/styles'
import React from 'react'

import LoginCard from './LoginCard'
import styles from './shared.styles'

const useStyles = makeStyles(styles)

const Login = () => {
  const classes = useStyles()

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
  );
}

export default Login
