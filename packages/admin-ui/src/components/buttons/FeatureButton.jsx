import classnames from 'classnames'
import React, { memo } from 'react'

import classes from './FeatureButton.module.css'

const FeatureButton = memo(
  ({ className, Icon, InverseIcon, children, ...props }) => {
    return (
      <button
        className={classnames(
          classes.baseButton,
          classes.roundButton,
          classes.primary,
          className,
        )}
        {...props}>
        {Icon && (
          <div className={classes.buttonIcon}>
            <Icon />
          </div>
        )}
        {InverseIcon && (
          <div
            className={classnames(
              classes.buttonIcon,
              classes.buttonIconActive,
            )}>
            <InverseIcon />
          </div>
        )}
        {children}
      </button>
    )
  },
)

export default FeatureButton
