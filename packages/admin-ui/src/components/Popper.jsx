import MaterialPopper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState } from 'react'

import { white } from 'src/styling/variables'
import classes from './Popper.module.css'

const Popover = ({ children, bgColor = white, className, ...props }) => {
  const [arrowRef, setArrowRef] = useState(null)

  const flipPlacements = {
    top: ['bottom'],
    bottom: ['top'],
    left: ['right'],
    right: ['left']
  }

  const modifiers = [
    {
      name: 'flip',
      enabled: R.defaultTo(false, props.flip),
      options: {
        allowedAutoPlacements: flipPlacements[props.placement]
      }
    },
    {
      name: 'preventOverflow',
      enabled: true,
      options: {
        rootBoundary: 'scrollParent'
      }
    },
    {
      name: 'offset',
      enabled: true,
      options: {
        offset: [0, 10]
      }
    },
    {
      name: 'arrow',
      enabled: R.defaultTo(true, props.showArrow),
      options: {
        element: arrowRef
      }
    },
    {
      name: 'computeStyles',
      options: {
        gpuAcceleration: false
      }
    }
  ]

  return (
    <>
      <MaterialPopper
        disablePortal={false}
        modifiers={modifiers}
        className={classnames(classes.tooltip, 'z-3000 rounded-sm')}
        {...props}>
        <Paper style={{ backgroundColor: bgColor }} className={className}>
          <span
            className={classes.newArrow}
            data-popper-arrow
            ref={setArrowRef}
          />
          {children}
        </Paper>
      </MaterialPopper>
    </>
  )
}

export default Popover
