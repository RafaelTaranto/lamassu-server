import React, { useState, useRef } from 'react'
import { Autocomplete, TextField } from '@mui/material'

export const AsyncAutocomplete = ({
  value,
  onChange,
  onSearch,
  getOptionLabel,
  getOptionId = option => option.id,
  placeholder = 'Search...',
  noOptionsText = 'Type to start searching...',
  minSearchLength = 2,
  debounceMs = 300,
  variant = 'standard',
  size = 'small',
  fullWidth = true,
  ...textFieldProps
}) => {
  const [options, setOptions] = useState([])
  const timeoutRef = useRef(null)

  // Simple debounce using timeout
  const debouncedSearch = searchTerm => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      onSearch(searchTerm).then(results => {
        setOptions(results)
      })
    }, debounceMs)
  }

  const handleInputChange = (event, newInputValue, reason) => {
    // Only search when user is typing, not when selecting an option
    if (
      reason === 'input' &&
      newInputValue &&
      newInputValue.length > minSearchLength
    ) {
      debouncedSearch(newInputValue)
    }
  }

  const handleBlur = () => {
    setOptions([])
  }

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) =>
        getOptionId(option) === getOptionId(value)
      }
      noOptionsText={noOptionsText}
      renderInput={params => (
        <TextField
          {...params}
          variant={variant}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          onBlur={handleBlur}
          {...textFieldProps}
        />
      )}
      size={size}
      fullWidth={fullWidth}
    />
  )
}
