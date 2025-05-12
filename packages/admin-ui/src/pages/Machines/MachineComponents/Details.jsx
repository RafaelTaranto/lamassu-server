import React from 'react'
import { Label1, P } from 'src/components/typography'

import { modelPrettifier } from 'src/utils/machine'
import { formatDate } from 'src/utils/timezones'

const Details = ({ data, timezone }) => {
  return (
    <div className="flex gap-30">
      <div>
        <Label1 className="text-comet mt-0">Paired at</Label1>
        <P>
          {data.pairedAt
            ? formatDate(data.pairedAt, timezone, 'yyyy-MM-dd HH:mm:ss')
            : ''}
        </P>
      </div>
      <div>
        <Label1 className="text-comet mt-0">Machine model</Label1>
        <P>{modelPrettifier[data.model]}</P>
      </div>
      <div>
        <Label1 className="text-comet mt-0">Software version</Label1>
        <P>{data.version}</P>
      </div>
    </div>
  )
}

export default Details
