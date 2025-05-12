import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import classnames from 'classnames'
import React from 'react'

const Dropdown = ({ label, name, options, onChange, value, className }) => {
  return (
    <FormControl variant="standard" className={classnames(className)}>
      <InputLabel>{label}</InputLabel>
      <Select
        variant="standard"
        autoWidth={true}
        labelId={label}
        id={name}
        value={value}
        onChange={onChange}>
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default Dropdown
