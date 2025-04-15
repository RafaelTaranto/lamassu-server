import { makeStyles } from '@mui/material'
import TextField from '@mui/material/TextField'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { memo } from 'react'

import styles from './TextInput.styles'

const useStyles = makeStyles(styles)

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
    // lg or sm
    size,
    bold,
    className,
    InputProps,
    ...props
  }) => {
    const classes = useStyles({ textAlign, width, size })
    const isTextFilled = !error && !R.isNil(value) && !R.isEmpty(value)
    const filled = isPasswordFilled || isTextFilled
    const inputClasses = {
      [classes.bold]: bold
    }

    return (
      <TextField
        variant="standard"
        id={name}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        value={value}
        classes={{ root: classes.root }}
        className={className}
        InputProps={{
          className: classnames(inputClasses),
          classes: {
            root: classes.size,
            underline: filled ? classes.underline : null
          },
          ...InputProps
        }}
        {...props} />
    );
  }
)

export default TextInput
