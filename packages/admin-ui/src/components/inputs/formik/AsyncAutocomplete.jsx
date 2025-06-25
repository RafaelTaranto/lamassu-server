import React, { useState } from 'react'
import { AsyncAutocomplete as BaseAsyncAutocomplete } from '../base/AsyncAutocomplete'

const AsyncAutocompleteFormik = ({ field, form, ...props }) => {
  const { name } = field
  const { touched, errors, setFieldValue } = form
  const [selectedOption, setSelectedOption] = useState(null)

  const error = touched[name] && errors[name]
  const getOptionId = props.getOptionId || (opt => opt.id)

  const handleChange = (event, newValue) => {
    setSelectedOption(newValue)
    setFieldValue(name, newValue ? getOptionId(newValue) : '')
  }

  return (
    <BaseAsyncAutocomplete
      {...props}
      name={name}
      value={selectedOption}
      onChange={handleChange}
      error={!!error}
      helperText={error || ''}
    />
  )
}

export const AsyncAutocomplete = AsyncAutocompleteFormik
