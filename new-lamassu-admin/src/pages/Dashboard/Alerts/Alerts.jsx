import { useQuery, gql } from '@apollo/client'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import classnames from 'classnames'
import * as R from 'ramda'
import React from 'react'
import { cardState } from 'src/components/CollapsibleCard'
import { Label1, H4 } from 'src/components/typography'

import AlertsTable from './AlertsTable'

const NUM_TO_RENDER = 3

const GET_ALERTS = gql`
  query getAlerts {
    alerts {
      id
      type
      detail
      message
      created
      read
      valid
    }
    machines {
      deviceId
      name
    }
  }
`

const Alerts = ({ onReset, onExpand, size }) => {
  const showAllItems = size === cardState.EXPANDED
  const { data } = useQuery(GET_ALERTS)
  const alerts = R.path(['alerts'])(data) ?? []
  const machines = R.compose(
    R.map(R.prop('name')),
    R.indexBy(R.prop('deviceId'))
  )(data?.machines ?? [])
  const alertsLength = alerts.length

  return (
    <>
      <div className="flex justify-between">
        <H4 noMargin>{`Alerts (${alertsLength})`}</H4>
        {showAllItems && (
          <Label1 noMargin className="-mt-1">
            <Button
              onClick={onReset}
              size="small"
              disableRipple
              disableFocusRipple
              className="p-0 text-zodiac normal-case">
              {'Show less'}
            </Button>
          </Label1>
        )}
      </div>
      <Grid
        className={classnames({ 'm-0': true, 'max-h-115': showAllItems })}
        container
        spacing={1}>
        <Grid item xs={12}>
          {!alerts.length && (
            <Label1 className="text-comet -ml-1 h-30">
              No new alerts. Your system is running smoothly.
            </Label1>
          )}
          <AlertsTable
            numToRender={showAllItems ? alerts.length : NUM_TO_RENDER}
            alerts={alerts}
            machines={machines}
          />
        </Grid>
      </Grid>
      {!showAllItems && alertsLength > NUM_TO_RENDER && (
        <Grid item xs={12}>
          <Label1 className="text-center mb-0">
            <Button
              onClick={() => onExpand('alerts')}
              size="small"
              disableRipple
              disableFocusRipple
              className="p-0 text-zodiac normal-case">
              {`Show all (${alerts.length})`}
            </Button>
          </Label1>
        </Grid>
      )}
    </>
  )
}
export default Alerts
