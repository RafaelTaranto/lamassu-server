import classnames from 'classnames'
import React, { memo } from 'react'

import moduleStyles from './Button.module.css'
import { spacer } from '../../styling/variables.js'

const pickSize = size => {
  switch (size) {
    case 'xl':
      return spacer * 7.625
    case 'sm':
      return spacer * 4
    case 'lg':
    default:
      return spacer * 5
  }
}

const ActionButton = memo(
  ({ size = 'lg', children, className, buttonClassName, ...props }) => {
    const height = pickSize(size)

    return (
      <div className={className} style={{ height: height + height / 12 }}>
        <button
          className={classnames(
            buttonClassName,
            moduleStyles.button,
            'text-white',
            {
              [moduleStyles.buttonSm]: size === 'sm',
              [moduleStyles.buttonXl]: size === 'xl'
            }
          )}
          {...props}>
          {children}
        </button>
      </div>
    )
  }
)

export default ActionButton
