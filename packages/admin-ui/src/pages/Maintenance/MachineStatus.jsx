import Visibility from '@mui/icons-material/Visibility'
import { useQuery, gql } from '@apollo/client'
import { formatDistance } from 'date-fns'
import * as R from 'ramda'
import React, { useMemo } from 'react'
import { useLocation } from 'wouter'
import {
  MRT_ActionMenuItem,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'

import { MainStatus } from '../../components/Status'
import Title from '../../components/Title'
import { Label1 } from '../../components/typography/index.jsx'
import WarningIcon from '../../styling/icons/status/pumpkin.svg?react'
import ErrorIcon from '../../styling/icons/status/tomato.svg?react'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts.js'

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
  const [, navigate] = useLocation()
  const addedMachineId = history.state?.id
  const {
    data: machinesResponse,
    refetch,
    loading: machinesLoading,
  } = useQuery(GET_MACHINES, { notifyOnNetworkStatusChange: true })
  const { data: configResponse, configLoading } = useQuery(GET_DATA)

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'deviceId',
      },
      {
        header: 'Machine name',
        accessorKey: 'name',
      },
      {
        header: 'Status',
        enableColumnFilter: false,
        accessorKey: 'statuses',
        Cell: ({ cell }) => <MainStatus statuses={cell.getValue()} />,
      },
      {
        header: 'Last ping',
        accessorKey: 'lastPing',
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          cell.getValue()
            ? formatDistance(new Date(cell.getValue()), new Date(), {
                addSuffix: true,
              })
            : 'unknown',
      },
      {
        header: 'Software version',
        enableColumnFilter: false,
        accessorKey: 'version',
        Cell: ({ cell }) => cell.getValue() || 'unknown',
      },
    ],
    [],
  )

  const timezone = R.path(['config', 'locale_timezone'], configResponse)

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    initialState: {
      ...defaultMaterialTableOpts.initialState,
      columnVisibility: {
        deviceId: false,
      },
      columnPinning: { right: ['mrt-row-actions'] },
      expanded: addedMachineId ? { [addedMachineId]: true } : {},
    },
    columns: columns,
    getRowId: it => it.deviceId,
    data: machinesResponse?.machines ?? [],
    enableSorting: false,
    enableExpandAll: false,
    enableRowActions: true,
    state: {
      isLoading: machinesLoading || configLoading,
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        header: '',
      },
    },
    renderRowActionMenuItems: ({ row }) => [
      <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => navigate(`/machines/${row.original.deviceId}`)}
        table={table}
      />,
    ],
    renderDetailPanel: ({ row }) =>
      row.original ? (
        <MachineDetailsRow
          it={row.original}
          onActionSuccess={refetch}
          timezone={timezone}
        />
      ) : null,
  })

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
      <MaterialReactTable table={table} />
    </>
  )
}

export default MachineStatus
