import Chip from '@mui/material/Chip'
import React from 'react'

const Status = ({ status }) => {
  return <Chip color={status.type} label={status.label} />
}

const MainStatus = ({ statuses }) => {
  const mainStatus =
    statuses.find(s => s.type === 'error') ||
    statuses.find(s => s.type === 'warning') ||
    statuses[0]
  const plus = { label: `+${statuses.length - 1}`, type: mainStatus.type }

  return (
    <div>
      <Status status={mainStatus} />
      {statuses.length > 1 && <Status status={plus} />}
    </div>
  )
}

export { Status, MainStatus }
