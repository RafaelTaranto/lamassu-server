import classnames from 'classnames'
import React, { memo } from 'react'

const Table = memo(({ className, children, ...props }) => {
  return (
    <table
      {...props}
      className={classnames(
        'table-fixed border-separate border-spacing-0',
        className,
      )}>
      {children}
    </table>
  )
})

export default Table
