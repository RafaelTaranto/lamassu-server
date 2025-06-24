import React, { useState, useEffect } from 'react'
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { AsyncAutocomplete } from './inputs/base/AsyncAutocomplete.jsx'

export const SelectFilter = ({ column, options = [] }) => {
  const columnFilterValue = column.getFilterValue()

  return (
    <FormControl variant="standard" size="small" fullWidth>
      <Select
        value={columnFilterValue || ''}
        onChange={event => {
          column.setFilterValue(event.target.value || undefined)
        }}
        displayEmpty
        variant="standard">
        <MenuItem value="">All</MenuItem>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export const AutocompleteFilter = ({
  column,
  options = [],
  placeholder = 'Filter...',
  renderOption,
  getOptionLabel = option => option.label || '',
}) => {
  const columnFilterValue = column.getFilterValue()
  const selectedOption =
    options.find(option => option.value === columnFilterValue) || null

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={(event, newValue) => {
        column.setFilterValue(newValue?.value || '')
      }}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) => option?.value === value?.value}
      renderOption={renderOption}
      renderInput={params => (
        <TextField
          {...params}
          variant="standard"
          placeholder={placeholder}
          size="small"
          fullWidth
        />
      )}
      size="small"
      fullWidth
      slotProps={{
        listbox: {
          style: { maxHeight: 200 },
        },
        popper: {
          style: { width: 'auto' },
        },
      }}
    />
  )
}

export const TextFilter = ({ column, placeholder = 'Filter...' }) => {
  const columnFilterValue = column.getFilterValue()

  return (
    <TextField
      value={columnFilterValue ?? ''}
      onChange={event => {
        column.setFilterValue(event.target.value || undefined)
      }}
      placeholder={placeholder}
      variant="standard"
      size="small"
      fullWidth
    />
  )
}

export const AsyncAutocompleteFilter = ({ column, ...props }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const columnFilterValue = column.getFilterValue()
  const getOptionId = props.getOptionId || (option => option.id)

  useEffect(() => {
    if (!columnFilterValue) {
      setSelectedOption(null)
    }
  }, [columnFilterValue])

  const handleChange = (event, newValue) => {
    column.setFilterValue(newValue ? getOptionId(newValue) : '')
    setSelectedOption(newValue)
  }

  return (
    <AsyncAutocomplete
      {...props}
      value={selectedOption}
      onChange={handleChange}
    />
  )
}
