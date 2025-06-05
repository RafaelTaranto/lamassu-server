import { useQuery, useLazyQuery, gql } from '@apollo/client'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { toUnit, formatCryptoAddress } from '@lamassu/coins/lightUtils'
import BigNumber from 'bignumber.js'
import * as R from 'ramda'
import React, { useEffect, useMemo } from 'react'
import { useLocation } from 'wouter'
import LogsDowloaderPopover from '../../components/LogsDownloaderPopper'
import { HelpTooltip } from '../../components/Tooltip'
import TxInIcon from '../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'
import CustomerLinkIcon from '../../styling/icons/month arrows/right.svg?react'
import CustomerLinkWhiteIcon from '../../styling/icons/month arrows/right_white.svg?react'

import { SupportLinkButton } from '../../components/buttons'
import { errorColor } from '../../styling/variables'
import * as Customer from '../../utils/customer'
import { formatDate } from '../../utils/timezones'

import DetailsRow from './DetailsCard'
import TitleSection from '../../components/layout/TitleSection.jsx'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  alignRight,
  defaultMaterialTableOpts,
} from '../../utils/materialReactTableOpts.js'
import { getStatusDetails } from './helper.js'
import {
  CustomerFilter,
  MachineFilter,
  DirectionFilter,
  CryptoFilter,
  StatusFilter,
  SweptFilter,
} from './Filters.jsx'

const NUM_LOG_RESULTS = 1000

const GET_DATA = gql`
  query getData {
    config
    machines {
      name
      deviceId
    }
    cryptoCurrencies {
      code
      display
    }
  }
`

const SEARCH_CUSTOMERS = gql`
  query searchCustomers($searchTerm: String!, $limit: Int) {
    searchCustomers(searchTerm: $searchTerm, limit: $limit) {
      id
      name
      phone
      email
    }
  }
`

const GET_TRANSACTIONS_CSV = gql`
  query transactions(
    $simplified: Boolean
    $limit: Int
    $from: DateTimeISO
    $until: DateTimeISO
    $timezone: String
    $excludeTestingCustomers: Boolean
  ) {
    transactionsCsv(
      simplified: $simplified
      limit: $limit
      from: $from
      until: $until
      timezone: $timezone
      excludeTestingCustomers: $excludeTestingCustomers
    )
  }
`

const GET_TRANSACTIONS = gql`
  query transactions(
    $limit: Int
    $offset: Int
    $from: DateTimeISO
    $until: DateTimeISO
    $txClass: String
    $deviceId: String
    $customerName: String
    $customerId: ID
    $fiatCode: String
    $cryptoCode: String
    $toAddress: String
    $status: String
    $swept: Boolean
  ) {
    transactions(
      limit: $limit
      offset: $offset
      from: $from
      until: $until
      txClass: $txClass
      deviceId: $deviceId
      customerName: $customerName
      customerId: $customerId
      fiatCode: $fiatCode
      cryptoCode: $cryptoCode
      toAddress: $toAddress
      status: $status
      swept: $swept
    ) {
      paginationStats {
        totalCount
      }
      id
      txClass
      txHash
      toAddress
      commissionPercentage
      expired
      machineName
      operatorCompleted
      sendConfirmed
      dispense
      hasError: error
      errorCode
      deviceId
      fiat
      fee
      fixedFee
      fiatCode
      cryptoAtoms
      cryptoCode
      toAddress
      created
      customerIdCardData
      customerIdCardPhotoPath
      customerFrontCameraPath
      txCustomerPhotoPath
      customerPhone
      customerEmail
      discount
      customerId
      isAnonymous
      batched
      batchTime
      rawTickerPrice
      batchError
      walletScore
      profit
      swept
      status
    }
  }
`

const useTableStore = create(
  immer(set => ({
    variables: { limit: NUM_LOG_RESULTS },
    columnFilters: [],
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    previousData: [],

    updateField: (field, updates) =>
      set(state => {
        if (typeof updates === 'function') {
          state[field] = updates(state[field])
        } else {
          state[field] = updates
        }
      }),
  })),
)

const Transactions = () => {
  const [, navigate] = useLocation()
  const { variables, columnFilters, pagination, previousData, updateField } =
    useTableStore()

  const { data: configResponse } = useQuery(GET_DATA)
  const { data, loading } = useQuery(GET_TRANSACTIONS, {
    variables,
    notifyOnNetworkStatusChange: true,
  })

  const [searchCustomersQuery] = useLazyQuery(SEARCH_CUSTOMERS)

  const displayData = useMemo(() => {
    const formattedData = (data?.transactions ?? []).map(row => ({
      ...row,
      toAddress: formatCryptoAddress(row.cryptoCode, row.toAddress),
    }))

    return loading && previousData.length > 0 ? previousData : formattedData
  }, [data])

  useEffect(() => {
    if (!loading && displayData && displayData.length > 0) {
      updateField('previousData', displayData)
    }
  }, [displayData, loading])

  useEffect(() => {
    listFilterChange({
      offset: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    })
  }, [pagination, columnFilters])

  const timezone = R.path(['config', 'locale_timezone'], configResponse)

  const machines = configResponse?.machines || []
  const cryptoCurrencies = configResponse?.cryptoCurrencies || []

  const columns = useMemo(
    () => [
      {
        header: 'Direction',
        accessorKey: 'txClass',
        Filter: DirectionFilter,
        grow: false,
        size: 50,
        muiTableBodyCellProps: {
          align: 'center',
        },
        Cell: ({ cell }) =>
          cell.getValue() === 'cashOut' ? <TxOutIcon /> : <TxInIcon />,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 315,
      },
      {
        accessorKey: 'swept',
        header: 'Swept',
        Filter: SweptFilter,
        size: 50,
        Cell: ({ cell }) => (cell.getValue() ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'machineName',
        header: 'Machine',
        Filter: ({ column }) => (
          <MachineFilter column={column} machines={machines} />
        ),
        size: 160,
        maxSize: 160,
      },
      {
        accessorKey: 'customerId',
        header: 'Customer',
        size: 202,
        Filter: ({ column }) => (
          <CustomerFilter column={column} onSearch={searchCustomers} />
        ),
        Cell: ({ row }) => (
          <div className="flex items-center justify-between w-full">
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {Customer.displayName(row.original)}
            </div>
            {!row.original.isAnonymous && (
              <div
                className="cursor-pointer flex"
                data-cy="customer-link"
                onClick={() => redirect(row.original.customerId)}>
                {getStatusDetails(row.original) ? (
                  <CustomerLinkWhiteIcon />
                ) : (
                  <CustomerLinkIcon />
                )}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'fiat',
        header: 'Cash',
        enableColumnFilter: false,
        size: 144,
        ...alignRight,
        Cell: ({ cell, row }) =>
          `${Number.parseFloat(cell.getValue())} ${row.original.fiatCode}`,
      },
      {
        accessorKey: 'cryptoAtoms',
        header: 'Crypto',
        Filter: ({ column }) => (
          <CryptoFilter column={column} cryptoCurrencies={cryptoCurrencies} />
        ),
        size: 150,
        ...alignRight,
        Cell: ({ cell, row }) =>
          `${toUnit(new BigNumber(cell.getValue()), row.original.cryptoCode)} ${
            row.original.cryptoCode
          }`,
      },
      {
        accessorKey: 'toAddress',
        header: 'Address',
        size: 140,
        muiTableBodyCellProps: {
          className: 'overflow-hidden whitespace-nowrap text-ellipsis',
        },
      },
      {
        accessorKey: 'created',
        header: 'Date',
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          timezone && formatDate(cell.getValue(), timezone, 'yyyy-MM-dd HH:mm'),
        ...alignRight,
        size: 155,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 80,
        Filter: StatusFilter,
        Cell: ({ cell }) => {
          if (cell.getValue() === 'Pending')
            return (
              <div className="flex items-center justify-between w-full">
                <div className="overflow-hidden whitespace-nowrap text-ellipsis">
                  Pending
                </div>
                <HelpTooltip width={200}>
                  <SupportLinkButton
                    link="https://support.lamassu.is/hc/en-us/articles/115001210452-Cancelling-cash-out-transactions"
                    label="Cancelling cash-out transactions"
                    bottomSpace="0"
                  />
                </HelpTooltip>
              </div>
            )
          else return cell.getValue()
        },
      },
    ],
    [machines, cryptoCurrencies, timezone],
  )

  const table = useMaterialReactTable({
    enableColumnResizing: true,
    ...defaultMaterialTableOpts,
    initialState: {
      ...defaultMaterialTableOpts.initialState,
      columnVisibility: {
        id: false,
        swept: false,
      },
    },
    columns: columns,
    rowCount: displayData?.[0]?.paginationStats?.totalCount ?? 0,
    getRowId: it => it.id,
    data: displayData || [],
    manualFiltering: true,
    manualPagination: true,
    enableSorting: false,
    onPaginationChange: it => {
      console.log('PAGINATION', it)
      updateField('pagination', it)
    },
    muiFilterTextFieldProps: {
      size: 'small',
    },
    muiFilterCheckboxProps: { size: 'small' },
    onColumnFiltersChange: it => updateField('columnFilters', it),
    enableExpandAll: false,
    state: {
      columnFilters,
      pagination,
      isLoading: loading,
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: getStatusDetails(row.original) ? '#ffeceb' : '',
      },
    }),
    displayColumnDefOptions: {
      'mrt-row-expand': {
        header: '',
      },
    },
    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //set only this row to be expanded
    }),
    renderDetailPanel: ({ row }) =>
      row.original ? (
        <DetailsRow it={row.original} timezone={timezone} />
      ) : null,
  })

  const searchCustomers = async searchTerm => {
    const { data } = await searchCustomersQuery({
      variables: { searchTerm, limit: 20 },
    })
    return data?.searchCustomers || []
  }

  const redirect = customerId => {
    return navigate(`/compliance/customer/${customerId}`)
  }

  const mapColumnFiltersToVariables = filters => {
    const filterMap = {
      machineName: 'deviceId',
      customerId: 'customerId',
      cryptoAtoms: 'cryptoCode',
      toAddress: 'toAddress',
      status: 'status',
      txClass: 'txClass',
      swept: 'swept',
    }

    return filters.reduce((acc, filter) => {
      const mappedKey = filterMap[filter.id] || filter.id
      if (mappedKey && filter.value !== undefined && filter.value !== '') {
        acc[mappedKey] = filter.value
      }
      return acc
    }, {})
  }

  const listFilterChange = inputs => {
    const { limit, offset } = inputs ?? {}
    const mappedFilters = mapColumnFiltersToVariables(columnFilters)

    updateField('variables', {
      limit,
      offset,
      ...mappedFilters,
    })
  }

  const errorLabel = (
    <svg width={12} height={12}>
      <rect width={12} height={12} rx={3} fill={errorColor} />
    </svg>
  )

  return (
    <>
      <TitleSection
        title="Transactions"
        labels={[
          { icon: <TxInIcon />, label: 'Cash-in' },
          { icon: <TxOutIcon />, label: 'Cash-out' },
          { icon: errorLabel, label: 'Transaction error' },
        ]}
        appendix={
          <div className="flex ml-4 gap-4">
            {
              <LogsDowloaderPopover
                title="Download logs"
                name="transactions"
                query={GET_TRANSACTIONS_CSV}
                getLogs={logs => R.path(['transactionsCsv'])(logs)}
                simplified
                timezone={timezone}
                args={{ timezone }}
              />
            }
          </div>
        }
      />
      <MaterialReactTable table={table} />
    </>
  )
}

export default Transactions
