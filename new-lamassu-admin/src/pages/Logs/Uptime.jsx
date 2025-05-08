import Chip from '@mui/material/Chip'
import * as R from 'ramda'
import React from 'react'

import { onlyFirstToUpper } from 'src/utils/string.js'
import { Label1 } from 'src/components/typography/index.jsx'

const Uptime = ({ process }) => {
  const uptime = time => {
    if (time < 60) return `${time}s`
    if (time < 3600) return `${Math.floor(time / 60)}m`
    if (time < 86400) return `${Math.floor(time / 60 / 60)}h`
    return `${Math.floor(time / 60 / 60 / 24)}d`
  }

  return (
    <div className="inline-block min-w-26 my-0 mx-5">
      <Label1 noMargin className="pl-1 color-comet">
        {R.toLower(process.name)}
      </Label1>
      <Chip
        color={process.state === 'RUNNING' ? 'success' : 'error'}
        label={
          process.state === 'RUNNING'
            ? `Running for ${uptime(process.uptime)}`
            : onlyFirstToUpper(process.state)
        }
      />
    </div>
  )
}

export default Uptime
