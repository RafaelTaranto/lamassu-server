import classnames from 'classnames'
import React, { memo } from 'react'

import { TL1 } from './typography'

const Subtitle = memo(({ children, className, extraMarginTop }) => {
  const classNames = {
    'text-comet my-4': true,
    'mt-18': extraMarginTop
  }

  return <TL1 className={classnames(classNames, className)}>{children}</TL1>
})

export default Subtitle
