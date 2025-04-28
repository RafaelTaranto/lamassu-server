import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import React, { useState } from 'react'
import { H2, Label1 } from 'src/components/typography'

import { Select } from 'src/components/inputs'
import { primaryColor } from 'src/styling/variables'

import Graph from '../../graphs/Graph'
import LegendEntry from '../LegendEntry'
import classes from './wrappers.module.css'

const OverTimeDotGraphHeader = ({
  title,
  representing,
  period,
  data,
  machines,
  selectedMachine,
  handleMachineChange,
  timezone,
  currency
}) => {
  const [logarithmic, setLogarithmic] = useState()

  const legend = {
    cashIn: <div className={classes.cashInIcon}></div>,
    cashOut: <div className={classes.cashOutIcon}></div>,
    transaction: <div className={classes.txIcon}></div>,
    median: (
      <svg height="12" width="18">
        <path
          stroke={primaryColor}
          strokeWidth="3"
          strokeDasharray="5, 2"
          d="M 5 6 l 20 0"
        />
      </svg>
    )
  }

  return (
    <>
      <div className={classes.graphHeaderWrapper}>
        <div className={classes.graphHeaderLeft}>
          <H2 noMargin>{title}</H2>
          <Box className={classes.graphLegend}>
            <LegendEntry IconElement={legend.cashIn} label={'Cash-in'} />
            <LegendEntry IconElement={legend.cashOut} label={'Cash-out'} />
            <LegendEntry
              IconElement={legend.transaction}
              label={'One transaction'}
            />
            <LegendEntry IconElement={legend.median} label={'Median'} />
          </Box>
        </div>
        <div className={classes.graphHeaderRight}>
          <div className={classes.graphHeaderSwitchBox}>
            <Label1 noMargin className="mb-1 text-comet">
              Log. scale
            </Label1>
            <Switch
              className="m-0"
              onChange={event => setLogarithmic(event.target.checked)}
            />
          </div>
          <Select
            label="Machines"
            onSelectedItemChange={handleMachineChange}
            items={machines}
            default={machines[0]}
            selectedItem={selectedMachine}
          />
        </div>
      </div>
      <Graph
        representing={representing}
        period={period}
        data={data}
        timezone={timezone}
        currency={currency}
        selectedMachine={selectedMachine}
        machines={machines}
        log={logarithmic}
      />
    </>
  )
}

export default OverTimeDotGraphHeader
