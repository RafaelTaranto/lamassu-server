import classnames from 'classnames'
import React, { memo } from 'react'

const TableCell = memo(
  ({ colspan, rightAlign, className, children, ...props }) => {
    const styles = {
      'py-0 px-6': true,
      'text-right': rightAlign
    }

    return (
      <td
        colSpan={colspan}
        className={classnames(styles, className)}
        {...props}>
        {children}
      </td>
    )
  }
)

export default TableCell
