import { useQuery, gql } from '@apollo/client'
import { formatDistance } from 'date-fns'
import * as R from 'ramda'
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MainStatus } from '../../components/Status'
import Title from '../../components/Title'
import DataTable from '../../components/tables/DataTable'
import { Label1 } from '../../components/typography/index.jsx'
import MachineRedirectIcon from '../../styling/icons/month arrows/right.svg?react'
import WarningIcon from '../../styling/icons/status/pumpkin.svg?react'
import ErrorIcon from '../../styling/icons/status/tomato.svg?react'

import MachineDetailsRow from './MachineDetailsCard'

const GET_MACHINES = gql`
  {
    machines {
      name
      deviceId
      lastPing
      pairedAt
      version
      paired
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
      version
      model
      statuses {
        label
        type
      }
      downloadSpeed
      responseTime
      packetLoss
    }
  }
`

const GET_DATA = gql`
  query getData {
    config
  }
`

const MachineStatus = () => {
  const history = useHistory()
  const { state } = useLocation()
  const addedMachineId = state?.id
  const {
    data: machinesResponse,
    refetch,
    loading: machinesLoading,
  } = useQuery(GET_MACHINES)
  const { data: configResponse, configLoading } = useQuery(GET_DATA)
  const timezone = R.path(['config', 'locale_timezone'], configResponse)

  const elements = [
    {
      header: 'Machine name',
      width: 250,
      size: 'sm',
      textAlign: 'left',
      view: m => (
        <div className="flex items-center gap-2">
          {m.name}
          <div
            onClick={() => {
              history.push(`/machines/${m.deviceId}`)
            }}>
            <MachineRedirectIcon />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      width: 350,
      size: 'sm',
      textAlign: 'left',
      view: m => <MainStatus statuses={m.statuses} />,
    },
    {
      header: 'Last ping',
      width: 200,
      size: 'sm',
      textAlign: 'left',
      view: m =>
        m.lastPing
          ? formatDistance(new Date(m.lastPing), new Date(), {
              addSuffix: true,
            })
          : 'unknown',
    },
    {
      header: 'Software version',
      width: 200,
      size: 'sm',
      textAlign: 'left',
      view: m => m.version || 'unknown',
    },
  ]

  const machines = R.path(['machines'])(machinesResponse) ?? []
  const expandedIndex = R.findIndex(R.propEq('deviceId', addedMachineId))(
    machines,
  )

  const InnerMachineDetailsRow = ({ it }) => (
    <MachineDetailsRow it={it} onActionSuccess={refetch} timezone={timezone} />
  )

  const loading = machinesLoading || configLoading

  return (
    <>
      <div className="flex justify-between items-center">
        <Title>Machine status</Title>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <WarningIcon />
            <Label1 noMargin>Warning</Label1>
          </div>
          <div className="flex items-center gap-2">
            <ErrorIcon />
            <Label1 noMargin>Error</Label1>
          </div>
        </div>
      </div>
      <DataTable
        loading={loading}
        elements={elements}
        data={machines}
        Details={InnerMachineDetailsRow}
        initialExpanded={expandedIndex}
        emptyText="No machines so far"
        expandable
      />
    </>
  )
}

export default MachineStatus
