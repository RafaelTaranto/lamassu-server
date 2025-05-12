import classnames from 'classnames'
import React, { memo } from 'react'

const TableRow = memo(
  ({ className, children, header, error, success, size = 'sm', ...props }) => {
    const classnamesObj = {
      'p-1 h-12 bg-white': !header,
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
