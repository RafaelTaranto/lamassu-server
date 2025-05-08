import TextField from '@mui/material/TextField'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { memo } from 'react'

import styles from './TextInput.module.css'

const TextInput = memo(
  ({
    name,
    isPasswordFilled,
    onChange,
    onBlur,
    value,
    error,
    suffix,
    textAlign,
    width,
    inputClasses,
    // lg or sm
    size,
    bold,
    className,
    InputProps,
    ...props
  }) => {
    const isTextFilled = !error && !R.isNil(value) && !R.isEmpty(value)
    const filled = isPasswordFilled || isTextFilled

    // Set CSS variables for dynamic styles
    const rootStyle = { 
      '--input-width': width,
      '--input-text-align': textAlign
    }

    // Determine size class based on size prop
    const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.size

    const divClass = {
      [styles.bold]: bold
    }

    return (
      <TextField
        variant="standard"
        id={name}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        value={value}
        classes={{ root: styles.root }}
        className={className}
        style={rootStyle}
        InputProps={{
          className: classnames(divClass),
          classes: {
            root: sizeClass,
            underline: filled ? styles.underline : null,
            input: inputClasses
          },
          ...InputProps
        }}
        {...props}
      />
    )
  }
)

export default TextInput
