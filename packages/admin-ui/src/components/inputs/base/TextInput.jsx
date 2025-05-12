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

    const style = {
      width: width,
      textAlign: textAlign
    }

    const sizeClass =
      size === 'sm'
        ? styles.sizeSm
        : size === 'lg'
          ? styles.sizeLg
          : styles.size

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
        className={className}
        style={style}
        {...props}
        slotProps={{
          input: {
            className: classnames(divClass),
            classes: {
              root: sizeClass,
              underline: filled ? styles.underline : null,
              input: inputClasses
            },
            ...InputProps
          },

          htmlInput: { style: { textAlign } }
        }} />
    );
  }
)

export default TextInput
