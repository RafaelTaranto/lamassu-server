import Radio from '@mui/material/Radio'
import MRadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import { makeStyles } from '@mui/styles'
import classnames from 'classnames'
import React from 'react'
import { Label1 } from 'src/components/typography'

import { offColor, secondaryColor } from 'src/styling/variables'
const styles = {
  label: {
    height: 16,
    lineHeight: '16px',
    margin: [[0, 0, 4, 0]],
    paddingLeft: 3
  },
  subtitle: {
    marginTop: -8,
    marginLeft: 32,
    color: offColor
  },
  radio: {
    color: secondaryColor
  }
}

const useStyles = makeStyles(styles)

const RadioGroup = ({
  name,
  label,
  value,
  options,
  onChange,
  className,
  labelClassName,
  radioClassName
}) => {
  const classes = useStyles()
  return (
    <>
      {label && <Label1 className={classes.label}>{label}</Label1>}
      <MRadioGroup
        name={name}
        value={value}
        onChange={onChange}
        className={classnames(className)}>
        {options.map((option, idx) => (
          <React.Fragment key={idx}>
            <div>
              <FormControlLabel
                disabled={option.disabled}
                value={option.code}
                control={<Radio className={classnames(classes.radio, radioClassName)} />}
                label={option.display}
                className={classnames(labelClassName)}
              />
              {option.subtitle && (
                <Label1 className={classes.subtitle}>{option.subtitle}</Label1>
              )}
            </div>
          </React.Fragment>
        ))}
      </MRadioGroup>
    </>
  )
}

export default RadioGroup
