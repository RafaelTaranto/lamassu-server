import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Button as MuiButton, IconButton } from '@mui/material'
import { useQuery, gql } from '@apollo/client'
import { formatDistance } from 'date-fns'
import * as R from 'ramda'
import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { MainStatus } from '../../components/Status'
import Title from '../../components/Title'
import { Label1 } from '../../components/typography/index.jsx'
import WarningIcon from '../../styling/icons/status/pumpkin.svg?react'
import ErrorIcon from '../../styling/icons/status/tomato.svg?react'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts.js'
import GroupModal from '../../components/machineActions/GroupModal'
import MachineActions from '../../components/machineActions/MachineActions'
import { modelPrettifier } from '../../utils/machine'
import { formatDate } from '../../utils/timezones'
import { SelectFilter } from '../../components/TableFilters'

const MachineRowActions = ({ machine, onActionSuccess }) => {
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null)

  return (
    <>
      <IconButton
        onClick={event => {
          setActionsMenuAnchor(event.currentTarget)
        }}>
        <MoreVertIcon />
      </IconButton>
      <MachineActions
        machine={machine}
        onActionSuccess={onActionSuccess}
        anchorEl={actionsMenuAnchor}
        open={Boolean(actionsMenuAnchor)}
        onClose={() => setActionsMenuAnchor(null)}
        showViewAction={true}
      />
    </>
  )
}

const MachineGroupFilter = ({ column, machineGroups }) => {
  const groupOptions = machineGroups?.map(group => ({
    label: group.name,
    value: group.name,
  }))

  return <SelectFilter column={column} options={groupOptions} />
}

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
      machineGroup {
        id
        name
      }
    }
  }
`

const GET_DATA = gql`
  query getData {
    configWithAllTriggers
  }
`

const GET_MACHINE_GROUPS = gql`
  query getMachineGroups {
    machineGroups {
      id
      name
    }
  }
`

const MachineStatus = () => {
  const [showGroupModal, setShowGroupModal] = useState(false)
  const {
    data: machinesResponse,
    refetch,
    loading: machinesLoading,
  } = useQuery(GET_MACHINES, { notifyOnNetworkStatusChange: true })
  const { data: configResponse, configLoading } = useQuery(GET_DATA)
  const { data: machineGroupsResponse } = useQuery(GET_MACHINE_GROUPS)

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
        header: 'Group',
        accessorKey: 'machineGroup.name',
        Cell: ({ cell }) => cell.getValue() || 'default',
        Filter: ({ column }) => (
          <MachineGroupFilter
            column={column}
            machineGroups={machineGroupsResponse?.machineGroups}
          />
        ),
        filterFn: (row, id, filterValue) => {
          const cellValue = row.getValue(id) || 'default'
          return cellValue === filterValue
        },
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
      {
        header: 'Machine model',
        enableColumnFilter: false,
        accessorKey: 'model',
        Cell: ({ cell }) => modelPrettifier[cell.getValue()] || cell.getValue(),
      },
      {
        header: 'Paired at',
        enableColumnFilter: false,
        accessorKey: 'pairedAt',
        Cell: ({ cell }) =>
          timezone && cell.getValue()
            ? formatDate(cell.getValue(), timezone, 'yyyy-MM-dd HH:mm:ss')
            : 'unknown',
      },
      {
        header: 'Network speed',
        enableColumnFilter: false,
        accessorKey: 'downloadSpeed',
        Cell: ({ cell }) =>
          cell.getValue()
            ? new BigNumber(cell.getValue()).toFixed(4).toString() + ' MB/s'
            : 'unavailable',
      },
      {
        header: 'Latency',
        enableColumnFilter: false,
        accessorKey: 'responseTime',
        Cell: ({ cell }) =>
          cell.getValue()
            ? new BigNumber(cell.getValue()).toFixed(3).toString() + ' ms'
            : 'unavailable',
      },
      {
        header: 'Packet loss',
        enableColumnFilter: false,
        accessorKey: 'packetLoss',
        Cell: ({ cell }) =>
          cell.getValue()
            ? new BigNumber(cell.getValue()).toFixed(3).toString() + ' %'
            : 'unavailable',
      },
    ],
    [machineGroupsResponse],
  )

  const timezone = R.path(
    ['configWithAllTriggers', 'locale_timezone'],
    configResponse,
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    initialState: {
      ...defaultMaterialTableOpts.initialState,
      columnVisibility: {
        deviceId: false,
        model: false,
        pairedAt: false,
        downloadSpeed: false,
        responseTime: false,
        packetLoss: false,
      },
      columnPinning: { right: ['mrt-row-actions'] },
    },
    columns: columns,
    getRowId: it => it.deviceId,
    data: machinesResponse?.machines ?? [],
    enableRowSelection: true,
    enableSorting: false,
    enableRowActions: true,
    state: {
      isLoading: machinesLoading || configLoading,
    },
    renderRowActions: ({ row }) => (
      <MachineRowActions machine={row.original} onActionSuccess={refetch} />
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().flatRows

      return (
        <MuiButton
          color="secondary"
          size="small"
          disabled={selectedRows.length === 0}
          variant="contained"
          onClick={() => setShowGroupModal(true)}>
          Change Group
        </MuiButton>
      )
    },
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
      {showGroupModal && (
        <GroupModal
          deviceIds={table
            .getSelectedRowModel()
            .flatRows.map(row => row.original.deviceId)}
          onClose={() => {
            setShowGroupModal(false)
          }}
          onSuccess={() => {
            refetch()
            table.resetRowSelection()
          }}
        />
      )}
    </>
  )
}

export default MachineStatus
