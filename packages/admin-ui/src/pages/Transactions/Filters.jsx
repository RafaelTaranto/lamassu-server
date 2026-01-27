import React from 'react'
import {
  AutocompleteFilter,
  MultiAutocompleteFilter,
  SelectFilter,
  AsyncAutocompleteFilter,
} from '../../components/TableFilters'

export const DirectionFilter = ({ column }) => {
  const options = [
    { label: 'Cash-in', value: 'cashIn' },
    { label: 'Cash-out', value: 'cashOut' },
  ]

  return <SelectFilter column={column} options={options} />
}

export const SweptFilter = ({ column }) => {
  const options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]

  return <SelectFilter column={column} options={options} />
}

export const StatusFilter = ({ column }) => {
  const options = [
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Error', value: 'Error' },
    { label: 'Success', value: 'Success' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Sent', value: 'Sent' },
  ]

  return <SelectFilter column={column} options={options} />
}

export const MachineFilter = ({ column, machines }) => {
  const machineOptions = machines.map(machine => ({
    label: machine.name,
    value: machine.deviceId,
  }))

  const renderOption = (props, option) => (
    <li {...props}>
      <div>
        <div>{option.label}</div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>{option.value}</div>
      </div>
    </li>
  )

  return (
    <MultiAutocompleteFilter
      column={column}
      options={machineOptions}
      placeholder="Filter machines..."
      renderOption={renderOption}
    />
  )
}

export const MachineGroupFilter = ({ column, machineGroups }) => {
  const options = machineGroups.map(group => ({
    label: group.name,
    value: group.id,
  }))

  return (
    <AutocompleteFilter
      column={column}
      options={options}
      placeholder="Filter groups..."
    />
  )
}

export const CryptoFilter = ({ column, cryptoCurrencies }) => {
  const cryptoOptions = cryptoCurrencies.map(crypto => ({
    label: crypto.code,
    value: crypto.code,
  }))

  return (
    <AutocompleteFilter
      column={column}
      options={cryptoOptions}
      placeholder="Filter crypto..."
    />
  )
}

export const CustomerFilter = ({ column, onSearch }) => (
  <AsyncAutocompleteFilter
    column={column}
    onSearch={onSearch}
    getOptionLabel={option => {
      const name = option.name || 'Unknown'
      const contact = option.phone || option.email || ''
      return contact ? `${name} (${contact})` : name
    }}
    placeholder="Search customers..."
    noOptionsText="Type to start searching..."
  />
)
