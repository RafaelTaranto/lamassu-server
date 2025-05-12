import classnames from 'classnames'
import React, { memo } from 'react'

const TableHeaderCell = memo(
  ({ rightAlign, children, className, ...props }) => {
    const styles = {
      'bg-zodiac text-white py-0 px-6 h-8 text-sm text-left': true,
      'text-right': rightAlign,
    }

    return (
      <th {...props} className={classnames(styles, className)}>
        {children}
      </th>
    )
  },
)

export default TableHeaderCell
