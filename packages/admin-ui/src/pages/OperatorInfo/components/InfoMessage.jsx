import React from 'react'

import { Label1 } from 'src/components/typography'

const InfoMessage = ({ Icon, children }) => (
  <div className="flex my-13 gap-4">
    <Icon />
    <Label1 className="w-83 text-comet mt-1">{children}</Label1>
  </div>
)

export default InfoMessage
