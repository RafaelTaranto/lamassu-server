import React from 'react'
import { P } from 'src/components/typography'

const LegendEntry = ({ IconElement, IconComponent, label }) => {
  return (
    <span className="flex items-center gap-2">
      {!!IconComponent && <IconComponent height={12} />}
      {!!IconElement && IconElement}
      <P>{label}</P>
    </span>
  )
}

export default LegendEntry
