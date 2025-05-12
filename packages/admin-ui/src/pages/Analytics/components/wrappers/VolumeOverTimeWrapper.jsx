import Switch from '@mui/material/Switch'
import React, { useState } from 'react'
import { H2, Label1 } from 'src/components/typography'

import { Select } from 'src/components/inputs'
import { neon, java } from 'src/styling/variables'

import Graph from '../../graphs/Graph'
import LegendEntry from '../LegendEntry'
import classes from './wrappers.module.css'

const VolumeOverTimeGraphHeader = ({
  title,
  representing,
  period,
  data,
  machines,
  selectedMachine,
  handleMachineChange,
  timezone,
  currency,
}) => {
  const [logarithmic, setLogarithmic] = useState()

  const legend = {
    cashIn: (
      <svg height="12" width="18">
        <path
          stroke={java}
          strokeWidth="3"
          d="M 3 6 l 12 0"
          strokeLinecap="round"
        />
      </svg>
    ),
    cashOut: (
      <svg height="12" width="18">
        <path
          stroke={neon}
          strokeWidth="3"
          d="M 3 6 l 12 0"
          strokeLinecap="round"
        />
      </svg>
    ),
  }

  return (
    <>
      <div className={classes.graphHeaderWrapper}>
        <div className={classes.graphHeaderLeft}>
          <H2 noMargin>{title}</H2>
          <div className={classes.graphLegend}>
            <LegendEntry IconElement={legend.cashIn} label={'Cash-in'} />
            <LegendEntry IconElement={legend.cashOut} label={'Cash-out'} />
          </div>
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

export default VolumeOverTimeGraphHeader
