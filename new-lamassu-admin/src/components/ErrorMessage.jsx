import classnames from 'classnames'
import React from 'react'
import ErrorIcon from 'src/styling/icons/warning-icon/tomato.svg?react'

import { Info3 } from './typography'

const ErrorMessage = ({ className, children }) => {
  return (
    <div className={classnames('flex items-center', className)}>
      <ErrorIcon className="mr-3" />
      <Info3 className="flex items-center text-tomato m-0 whitespace-break-spaces">
        {children}
      </Info3>
    </div>
  )
}

export default ErrorMessage
