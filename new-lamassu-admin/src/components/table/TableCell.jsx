import classnames from 'classnames'
import React, { memo } from 'react'

import classes from './Table.module.css'

const TableCell = memo(
  ({ colspan, rightAlign, className, children, ...props }) => {
    const styles = {
      [classes.tableCell]: true,
      'text-right': rightAlign
    }

    return (
      <td
        colSpan={colspan}
        className={classnames(className, styles)}
        {...props}>
        {children}
      </td>
    )
  }
)

export default TableCell
