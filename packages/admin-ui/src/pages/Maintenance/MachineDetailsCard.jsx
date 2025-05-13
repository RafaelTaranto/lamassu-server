import BigNumber from 'bignumber.js'
import React from 'react'

import MachineActions from '../../components/machineActions/MachineActions'
import { Label1 } from '../../components/typography/index.jsx'

import { modelPrettifier } from '../../utils/machine'
import { formatDate } from '../../utils/timezones'

const Label = ({ children }) => {
  return <Label1 className="text-comet mb-1">{children}</Label1>
}

const MachineDetailsRow = ({ it: machine, onActionSuccess, timezone }) => {
  return (
    <div className="flex flex-wrap mt-3 mb-4 text-sm">
      <div className="w-1/4">
        <Label>Machine model</Label>
        <span>{modelPrettifier[machine.model]}</span>
      </div>
      <div className="w-1/4">
        <Label>Paired at</Label>
        <span>
          {timezone &&
            formatDate(machine.pairedAt, timezone, 'yyyy-MM-dd HH:mm:ss')}
        </span>
      </div>
      <div className="w-1/2 flex-1/2">
        <MachineActions
          machine={machine}
          onActionSuccess={onActionSuccess}></MachineActions>
      </div>
      <div className="w-1/6">
        <Label>Network speed</Label>
        <span>
          {machine.downloadSpeed
            ? new BigNumber(machine.downloadSpeed).toFixed(4).toString() +
              '  MB/s'
            : 'unavailable'}
        </span>
      </div>
      <div className="w-1/6">
        <Label>Latency</Label>
        <span>
          {machine.responseTime
            ? new BigNumber(machine.responseTime).toFixed(3).toString() + '  ms'
            : 'unavailable'}
        </span>
      </div>
      <div className="w-1/6">
        <Label>Packet loss</Label>
        <span>
          {machine.packetLoss
            ? new BigNumber(machine.packetLoss).toFixed(3).toString() + '  %'
            : 'unavailable'}
        </span>
      </div>
    </div>
  )
}

export default MachineDetailsRow
