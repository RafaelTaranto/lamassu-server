import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import * as R from 'ramda'
import React from 'react'
import { useLocation } from 'wouter'
import { P } from '../../../components/typography/index'
import Wrench from '../../../styling/icons/action/wrench/zodiac.svg?react'
import CashBoxEmpty from '../../../styling/icons/cassettes/cashbox-empty.svg?react'
import AlertLinkIcon from '../../../styling/icons/month arrows/right.svg?react'
import WarningIcon from '../../../styling/icons/warning-icon/tomato.svg?react'

const icons = {
  error: <WarningIcon style={{ height: 20, width: 20, marginRight: 12 }} />,
  fiatBalance: (
    <CashBoxEmpty style={{ height: 18, width: 18, marginRight: 14 }} />
  ),
}

const links = {
  error: '/maintenance/machine-status',
  fiatBalance: '/maintenance/cash-units',
  cryptoBalance: '/maintenance/funding',
}

const AlertsTable = ({ numToRender, alerts, machines }) => {
  const [, navigate] = useLocation()
  const alertsToRender = R.slice(0, numToRender, alerts)

  const alertMessage = alert => {
    const deviceId = alert.detail.deviceId
    if (!deviceId) return `${alert.message}`

    const deviceName = R.defaultTo('Unpaired device', machines[deviceId])
    return `${alert.message} - ${deviceName}`
  }

  return (
    <List dense className="max-h-116 overflow-y-auto overflow-x-hidden">
      {alertsToRender.map((alert, idx) => {
        return (
          <ListItem key={idx}>
            {icons[alert.type] || (
              <Wrench style={{ height: 23, width: 23, marginRight: 8 }} />
            )}
            <P className="my-2">{alertMessage(alert)}</P>
            <AlertLinkIcon
              className="ml-auto cursor-pointer"
              onClick={() => navigate(links[alert.type] || '/dashboard')}
            />
          </ListItem>
        )
      })}
    </List>
  )
}

export default AlertsTable
