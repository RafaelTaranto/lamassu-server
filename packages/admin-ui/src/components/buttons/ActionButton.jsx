import classnames from 'classnames'
import React, { memo } from 'react'

import moduleStyles from './ActionButton.module.css'

const ActionButton = memo(
  ({
    className,
    altTextColor,
    Icon,
    InverseIcon,
    color,
    center,
    children,
    ...props
  }) => {
    const classNames = {
      [moduleStyles.actionButton]: true,
      [moduleStyles.altText]: altTextColor || color !== 'primary',
      [moduleStyles.primary]: color === 'primary',
      [moduleStyles.secondary]: color === 'secondary',
      [moduleStyles.spring]: color === 'spring',
      [moduleStyles.tomato]: color === 'tomato',
      [moduleStyles.center]: center,
    }

    return (
      <button className={classnames(classNames, className)} {...props}>
        {Icon && (
          <div className={moduleStyles.actionButtonIcon}>
            <Icon />
          </div>
        )}
        {InverseIcon && (
          <div
            className={classnames(
              moduleStyles.actionButtonIcon,
              moduleStyles.actionButtonIconActive,
            )}>
            <InverseIcon />
          </div>
        )}
        {children && <div>{children}</div>}
      </button>
    )
  },
)

export default ActionButton
