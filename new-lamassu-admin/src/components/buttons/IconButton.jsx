import { IconButton as IconB } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React from 'react'

import { comet } from 'src/styling/variables'

const styles = {
  root: ({ size }) => ({
    width: size,
    height: size,
    '& svg': {
      flex: 1
    },
    '&:hover': {
      backgroundColor: 'inherit'
    },
    '&:hover rect': {
      stroke: comet
    },
    '&:hover polygon': {
      stroke: comet
    },
    '&:hover path': {
      stroke: comet
    }
  })
}

const useStyles = makeStyles(styles)

const IconButton = ({ size, children, onClick, ...props }) => {
  const classes = useStyles({ size })
  return (
    <IconB
      {...props}
      size="small"
      classes={{ root: classes.root }}
      disableRipple
      onClick={onClick}>
      {children}
    </IconB>
  )
}

export default IconButton
