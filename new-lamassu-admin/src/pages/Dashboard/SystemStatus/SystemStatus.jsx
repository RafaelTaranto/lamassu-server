import { useQuery, gql } from '@apollo/client'
import Button from '@mui/material/Button'
import classnames from 'classnames'
import * as R from 'ramda'
import React from 'react'
import { cardState as cardState_ } from 'src/components/CollapsibleCard'
import { H4, TL2, Label1 } from 'src/components/typography'

import MachinesTable from './MachinesTable'

// number of machines in the table to render on page load
const NUM_TO_RENDER = 4

const GET_DATA = gql`
  query getData {
    machines {
      name
      deviceId
      cashUnits {
        cashbox
        cassette1
        cassette2
        cassette3
        cassette4
        recycler1
        recycler2
        recycler3
        recycler4
        recycler5
        recycler6
      }
      numberOfCassettes
      numberOfRecyclers
      statuses {
        label
        type
      }
    }
    serverVersion
    uptime {
      name
      state
      uptime
    }
  }
`

/* const parseUptime = time => {
  if (time < 60) return `${time}s`
  if (time < 3600) return `${Math.floor(time / 60)}m`
  if (time < 86400) return `${Math.floor(time / 60 / 60)}h`
  return `${Math.floor(time / 60 / 60 / 24)}d`
} */

const SystemStatus = ({ onReset, onExpand, size }) => {
  const { data, loading } = useQuery(GET_DATA)

  const machines = R.path(['machines'])(data) ?? []
  const showAllItems = size === cardState_.EXPANDED

  const machinesTableContainerClasses = {
    'h-55': !showAllItems,
    'h-103': showAllItems
  }
  // const uptime = data?.uptime ?? [{}]
  return (
    <>
      <div className="flex justify-between">
        <H4 className="mt-0">System status</H4>
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
      {!loading && (
        <>
          <div className="mb-4">
            <TL2 className="inline">{data?.serverVersion}</TL2>
            <Label1 className="inline"> server version</Label1>
          </div>
          <div className={classnames(machinesTableContainerClasses)}>
            <MachinesTable
              numToRender={showAllItems ? Infinity : NUM_TO_RENDER}
              machines={machines}
            />
          </div>
          {!showAllItems && machines.length > NUM_TO_RENDER && (
            <div>
              <Label1 className="text-center mb-0">
                <Button
                  onClick={() => onExpand()}
                  size="small"
                  disableRipple
                  disableFocusRipple
                  className="p-0 text-zodiac normal-case">
                  {`Show all (${machines.length})`}
                </Button>
              </Label1>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default SystemStatus
