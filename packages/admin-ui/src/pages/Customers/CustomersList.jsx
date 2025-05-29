import Visibility from '@mui/icons-material/Visibility'
import { format } from 'date-fns/fp'
import * as R from 'ramda'
import React, { useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  useMaterialReactTable,
} from 'material-react-table'
import { MainStatus } from '../../components/Status'
import TxInIcon from '../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'
import {
  defaultMaterialTableOpts,
  alignRight,
} from '../../utils/materialReactTableOpts'

import { getFormattedPhone, getName } from './helper'

const CustomersList = ({ data, country, onClick, loading }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 315,
      },
      {
        id: 'phone-email',
        accessorFn: it =>
          `${getFormattedPhone(it.phone, country) || ''} ${it.email || ''}`,
        size: 180,
        header: 'Phone/email',
      },
      {
        id: 'name',
        header: 'Name',
        accessorFn: getName,
      },
      {
        accessorKey: 'totalTxs',
        header: 'Total txs',
        size: 126,
        enableColumnFilter: false,
        ...alignRight,
      },
      {
        accessorKey: 'totalSpent',
        size: 152,
        enableColumnFilter: false,
        Cell: ({ cell, row }) =>
          `${Number.parseFloat(cell.getValue())} ${row.original.lastTxFiatCode ?? ''}`,
        header: 'Total spent',
        ...alignRight,
      },
      {
        header: 'Last transaction',
        ...alignRight,
        size: 170,
        enableColumnFilter: false,
        accessorKey: 'lastTxFiat',
        Cell: ({ cell, row }) => {
          const hasLastTx = !R.isNil(row.original.lastTxFiatCode)
          const LastTxIcon =
            row.original.lastTxClass === 'cashOut' ? TxOutIcon : TxInIcon
          const lastIcon = <LastTxIcon className="ml-3" />
          return (
            <>
              {hasLastTx &&
                `${parseFloat(cell.getValue())} ${row.original.lastTxFiatCode ?? ''}`}
              {hasLastTx && lastIcon}
            </>
          )
        },
      },
      {
        accessorKey: 'lastActive',
        header: 'Last active',
        size: 133,
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          (cell.getValue() &&
            format('yyyy-MM-dd', new Date(cell.getValue()))) ??
          '',
      },
      {
        header: 'Status',
        size: 150,
        enableColumnFilter: false,
        accessorKey: 'authorizedStatus',
        sortingFn: (rowA, rowB) => {
          const statusOrder = { success: 0, warning: 1, error: 2 }
          const statusA = rowA.original.authorizedStatus.type
          const statusB = rowB.original.authorizedStatus.type

          if (statusA === statusB) {
            return rowA.original.authorizedStatus.label.localeCompare(
              rowB.original.authorizedStatus.label,
            )
          }

          return statusOrder[statusA] - statusOrder[statusB]
        },
        Cell: ({ cell }) => <MainStatus statuses={[cell.getValue()]} />,
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    columns,
    data,
    initialState: {
      ...defaultMaterialTableOpts.initialState,
      columnVisibility: {
        id: false,
      },
      sorting: [{ id: 'lastActive', desc: true }],
      columnPinning: { right: ['mrt-row-actions'] },
    },
    state: { isLoading: loading },
    getRowId: it => it.id,
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => onClick(row)}
        table={table}
      />,
    ],
  })

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  )
}

export default CustomersList
