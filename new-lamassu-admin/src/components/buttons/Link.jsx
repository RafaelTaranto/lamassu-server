import classnames from 'classnames'
import React, { memo } from 'react'

import classes from './Link.module.css'

const Link = memo(
  ({ submit, className, children, color = 'primary', ...props }) => {
    const classNames = {
      [classes.link]: true,
      [classes.primary]: color === 'primary',
      [classes.secondary]: color === 'secondary',
      [classes.noColor]: color === 'noColor',
      [classes.action]: color === 'action'
    }

    return (
      <button
        type={submit ? 'submit' : 'button'}
        className={classnames(classNames, className)}
        {...props}>
        {children}
      </button>
    )
  }
)

export default Link
