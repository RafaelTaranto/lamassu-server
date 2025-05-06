import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'

const MachineSidebar = ({ data, getText, getKey, isSelected, selectItem }) => {
  return (
    <List className="h-100 overflow-y-auto">
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
