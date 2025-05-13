import classNames from 'classnames'
import React, { memo } from 'react'
import { H4 } from '../typography'
import EmptyTableIcon from '../../styling/icons/table/empty-table.svg?react'

const EmptyTable = memo(({ message, className }) => {
  return (
    <div
      className={classNames(
        className,
        'flex flex-col items-center w-full mt-13 text-sm font-bold font-museo',
      )}>
      <EmptyTableIcon />
      <H4>{message}</H4>
    </div>
  )
})

export default EmptyTable
