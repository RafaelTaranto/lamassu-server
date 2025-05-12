import Grid from '@mui/material/Grid'
import { makeStyles } from '@mui/styles'
import React from 'react'

import styles from './Dashboard.styles'
import SystemPerformance from './SystemPerformance'

const useStyles = makeStyles(styles)

const LeftSide = () => {
  const classes = useStyles()

  return (
    <Grid item xs={12} className={classes.displayFlex}>
      <div className={classes.card}>
        <SystemPerformance />
      </div>
    </Grid>
  )
}

export default LeftSide
