import classnames from 'classnames'
import React, { memo, useState } from 'react'
import { H4 } from 'src/components/typography'
import CancelIconInverse from 'src/styling/icons/button/cancel/white.svg?react'

import classes from './SubpageButton.module.css'

const SubpageButton = memo(
  ({
    className,
    Icon,
    InverseIcon,
    toggle,
    forceDisable = false,
    children,
  }) => {
    const [active, setActive] = useState(false)
    const isActive = forceDisable ? false : active
    const classNames = {
      [classes.button]: true,
      [classes.normal]: !isActive,
      [classes.active]: isActive,
    }

    const normalButton = <Icon className={classes.buttonIcon} />

    const activeButton = (
      <>
        <InverseIcon
          className={classnames(
            classes.buttonIcon,
            classes.buttonIconActiveLeft,
          )}
        />
        <H4 className="text-white">{children}</H4>
        <CancelIconInverse
          className={classnames(
            classes.buttonIcon,
            classes.buttonIconActiveRight,
          )}
        />
      </>
    )

    const innerToggle = () => {
      forceDisable = false
      const newActiveState = !isActive
      toggle(newActiveState)
      setActive(newActiveState)
    }

    return (
      <button
        className={classnames(classNames, className)}
        onClick={innerToggle}>
        {isActive ? activeButton : normalButton}
      </button>
    )
  },
)

export default SubpageButton
