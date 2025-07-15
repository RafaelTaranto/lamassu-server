import BigNumber from 'bignumber.js'
import { formatDistance } from 'date-fns'
import React, { useState } from 'react'
import { Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Status } from '../../../components/Status'
import MachineActions from '../../../components/machineActions/MachineActions'
import { H3, Label1, P } from '../../../components/typography'
import CopyToClipboard from '../../../components/CopyToClipboard.jsx'

const Overview = ({ data, onActionSuccess }) => {
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null)

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
        <Button
          variant="contained"
          color="secondary"
          endIcon={<ExpandMoreIcon />}
          onClick={event => setActionsMenuAnchor(event.currentTarget)}>
          Actions
        </Button>
        <MachineActions
          machine={data}
          onActionSuccess={onActionSuccess}
          anchorEl={actionsMenuAnchor}
          open={Boolean(actionsMenuAnchor)}
          onClose={() => setActionsMenuAnchor(null)}
        />
      </div>
    </div>
  )
}

export default Overview
