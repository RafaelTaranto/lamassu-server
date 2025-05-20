import classnames from 'classnames'
import React from 'react'

import { Label1 } from '../../components/typography/index.jsx'

const TableLabel = ({ className, label, color, ...props }) => {
  return (
    <div className={classnames('flex items-center', className)} {...props}>
      {color && (
        <div
          className="rounded-sm h-3 w-3 mr-2"
          style={{ backgroundColor: color }}
        />
      )}
      <Label1 {...props}>{label}</Label1>
    </div>
  )
}

export default TableLabel
