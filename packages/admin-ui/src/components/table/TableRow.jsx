import classnames from 'classnames'
import React, { memo } from 'react'

const TableRow = memo(
  ({ className, children, header, error, success, size = 'sm', ...props }) => {
    const classnamesObj = {
      'p-1 bg-white': !header,
      'h-12': !header && size !== 'sm' && size !== 'lg',
      'h-8': !header && size === 'sm',
      'h-9 font-bold text-base ': !header && size === 'lg',
      'bg-misty-rose': error,
      'bg-spring3': success,
    }

    return (
      <tr className={classnames(classnamesObj, className, 'text-')} {...props}>
        {children}
      </tr>
    )
  },
)

export default TableRow
