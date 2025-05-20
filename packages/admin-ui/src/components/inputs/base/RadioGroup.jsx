import Radio from '@mui/material/Radio'
import MRadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import classnames from 'classnames'
import React from 'react'
import { Label1 } from '../../typography'

const RadioGroup = ({
  name,
  label,
  value,
  options,
  onChange,
  className,
  labelClassName,
  radioClassName,
}) => {
  return (
    <>
      {label && (
        <Label1 className="h-4 leading-4 m-0 mb-1 pl-1">{label}</Label1>
      )}
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
                control={
                  <Radio
                    className={classnames('text-spring', radioClassName)}
                  />
                }
                label={option.display}
                className={classnames(labelClassName)}
              />
              {option.subtitle && (
                <Label1 className="-mt-2 ml-8">{option.subtitle}</Label1>
              )}
            </div>
          </React.Fragment>
        ))}
      </MRadioGroup>
    </>
  )
}

export default RadioGroup
