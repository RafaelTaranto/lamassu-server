import MUIToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import React from 'react'
import { H4, P } from '../../typography'

const ToggleButtonGroup = ({
  name,
  orientation = 'vertical',
  value,
  exclusive = true,
  onChange,
  size = 'small',
  ...props
}) => {
  return (
    <MUIToggleButtonGroup
      size={size}
      name={name}
      orientation={orientation}
      value={value}
      exclusive={exclusive}
      onChange={onChange}>
      {props.options.map(option => {
        return (
          <ToggleButton
            className="bg-ghost"
            value={option.value}
            aria-label={option.value}
            key={option.value}>
            <div className="flex items-center justify-start w-9/10 overflow-hidden max-h-20">
              <option.icon />
              <div className="ml-8 normal-case text-left">
                <H4>{option.title}</H4>
                <P className="text-comet -mt-2"> {option.description}</P>
              </div>
            </div>
          </ToggleButton>
        )
      })}
    </MUIToggleButtonGroup>
  )
}

export default ToggleButtonGroup
