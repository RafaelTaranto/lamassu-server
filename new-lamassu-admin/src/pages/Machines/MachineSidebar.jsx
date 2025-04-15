import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { makeStyles } from '@mui/material/styles'
import React from 'react'

import styles from './Machines.styles'
const useStyles = makeStyles(styles)
const MachineSidebar = ({ data, getText, getKey, isSelected, selectItem }) => {
  const classes = useStyles()
  return (
    <List className={classes.sidebarContainer}>
      {data.map((item, idx) => {
        return (
          <ListItem
            disableRipple
            key={getKey(item) + idx}
            button
            selected={isSelected(getText(item))}
            onClick={() => selectItem(getText(item))}>
            <ListItemText primary={getText(item)} />
          </ListItem>
        )
      })}
    </List>
  )
}

export default MachineSidebar
