import BigNumber from 'bignumber.js'
import { formatDistance } from 'date-fns'
import React from 'react'
import { Status } from '../../../components/Status'
import MachineActions from '../../../components/machineActions/MachineActions'
import { H3, Label1, P } from '../../../components/typography'
import CopyToClipboard from '../../../components/CopyToClipboard.jsx'

const Overview = ({ data, onActionSuccess }) => {
  return (
    <div className="flex flex-col gap-8">
      <H3>{data.name}</H3>
      <div>
        <Label1 className="text-comet mt-0">Status</Label1>
        {data && data.statuses ? <Status status={data.statuses[0]} /> : null}
      </div>
      <div className="flex gap-6">
        <div>
          <Label1 className="text-comet mt-0">Ping</Label1>
          <P noMargin>
            {data.responseTime
              ? new BigNumber(data.responseTime).toFixed(3).toString() + ' ms'
              : 'unavailable'}
          </P>
        </div>
        <div>
          <Label1 className="text-comet mt-0">Last ping</Label1>
          <P noMargin>
            {data.lastPing
              ? formatDistance(new Date(data.lastPing), new Date(), {
                  addSuffix: true,
                })
              : 'unknown'}
          </P>
        </div>
        <div>
          <Label1 className="text-comet mt-0">Network speed</Label1>
          <P noMargin>
            {data.downloadSpeed
              ? new BigNumber(data.downloadSpeed)
                  .toFixed(data.downloadSpeed < 10 ? 2 : 0)
                  .toString() + ' MB/s'
              : 'unavailable'}
          </P>
        </div>
      </div>
      <div>
        <div>
          <Label1 className="text-comet mt-0">Device ID</Label1>
          <P className="wrap-anywhere" noMargin>
            <CopyToClipboard>{data.deviceId}</CopyToClipboard>
          </P>
        </div>
      </div>
      <div>
        <MachineActions
          machine={data}
          onActionSuccess={onActionSuccess}></MachineActions>
      </div>
    </div>
  )
}

export default Overview
