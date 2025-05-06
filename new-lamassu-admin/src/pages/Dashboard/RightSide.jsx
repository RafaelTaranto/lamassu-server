import Button from '@mui/material/Button'
import classnames from 'classnames'
import React, { useState } from 'react'
import CollapsibleCard, { cardState } from 'src/components/CollapsibleCard'
import { H4, Label1 } from 'src/components/typography'

import Alerts from './Alerts'
import SystemStatus from './SystemStatus'

const ShrunkCard = ({ title, buttonName, onUnshrink }) => {
  return (
    <div className="flex justify-between">
      <H4 className="mt-0">{title}</H4>
      <Label1 className="text-center my-0">
        <Button
          onClick={onUnshrink}
          size="small"
          disableRipple
          disableFocusRipple
          className="p-0 text-zodiac normal-case">
          {buttonName}
        </Button>
      </Label1>
    </div>
  )
}

const RightSide = () => {
  const [systemStatusSize, setSystemStatusSize] = useState(cardState.DEFAULT)
  const [alertsSize, setAlertsSize] = useState(cardState.DEFAULT)

  const onReset = () => {
    setAlertsSize(cardState.DEFAULT)
    setSystemStatusSize(cardState.DEFAULT)
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 flex flex-col gap-4">
        <CollapsibleCard
          className={classnames({
            'flex-[0.1]': alertsSize === cardState.SHRUNK,
            'flex-[0.9]': alertsSize === cardState.EXPANDED
          })}
          state={alertsSize}
          shrunkComponent={
            <ShrunkCard
              title={'Alerts'}
              buttonName={'Show alerts'}
              onUnshrink={onReset}
            />
          }>
          <Alerts
            onExpand={() => {
              setAlertsSize(cardState.EXPANDED)
              setSystemStatusSize(cardState.SHRUNK)
            }}
            onReset={onReset}
            size={alertsSize}
          />
        </CollapsibleCard>
        <CollapsibleCard
          className={classnames({
            'flex-[0.1]': systemStatusSize === cardState.SHRUNK,
            'flex-1': systemStatusSize === cardState.DEFAULT,
            'flex-[0.9]': systemStatusSize === cardState.EXPANDED
          })}
          state={systemStatusSize}
          shrunkComponent={
            <ShrunkCard
              title={'System status'}
              buttonName={'Show machines'}
              onUnshrink={onReset}
            />
          }>
          <SystemStatus
            onExpand={() => {
              setSystemStatusSize(cardState.EXPANDED)
              setAlertsSize(cardState.SHRUNK)
            }}
            onReset={onReset}
            size={systemStatusSize}
          />
        </CollapsibleCard>
      </div>
    </div>
  )
}

export default RightSide
