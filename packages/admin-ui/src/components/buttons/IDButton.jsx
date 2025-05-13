import ClickAwayListener from '@mui/material/ClickAwayListener'
import classnames from 'classnames'
import React, { useState, memo } from 'react'
import Popover from '../Popper'

import classes from './IDButton.module.css'

const IDButton = memo(
  ({
    name,
    className,
    Icon,
    InverseIcon,
    children,
    popoverClassname,
    ...props
  }) => {
    const [anchorEl, setAnchorEl] = useState(null)

    const open = Boolean(anchorEl)
    const id = open ? `simple-popper-${name}` : undefined

    const classNames = {
      [classes.idButton]: true,
      [classes.primary]: true,
      [classes.open]: open,
      [classes.closed]: !open,
    }

    const iconClassNames = {
      [classes.buttonIcon]: true,
    }

    const handleClick = event => {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }

    const handleClose = () => {
      setAnchorEl(null)
    }

    return (
      <>
        <ClickAwayListener onClickAway={handleClose}>
          <button
            aria-describedby={id}
            onClick={handleClick}
            className={classnames(classNames, className)}
            {...props}>
            {Icon && !open && (
              <div className={classnames(iconClassNames)}>
                <Icon />
              </div>
            )}
            {InverseIcon && open && (
              <div className={classnames(iconClassNames)}>
                <InverseIcon />
              </div>
            )}
          </button>
        </ClickAwayListener>
        <Popover
          className={popoverClassname}
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          placement="top"
          flip>
          <div className={classes.popoverContent}>
            <div>{children}</div>
          </div>
        </Popover>
      </>
    )
  },
)

export default IDButton
