import React, { memo } from 'react'

import { H1 } from './typography'

const Title = memo(({ children }) => {
  return <H1 className="my-6">{children}</H1>
})

export default Title
