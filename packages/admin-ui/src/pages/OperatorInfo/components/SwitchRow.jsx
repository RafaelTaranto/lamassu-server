import React, { memo } from 'react'
import { Label2, P } from '../../../components/typography/index.jsx'
import Switch from '@mui/material/Switch'

const SwitchRow = memo(({ title, disabled = false, checked, save }) => {
  return (
    <div className="flex justify-between w-99">
      <P>{title}</P>
      <div className="flex items-center">
        <Switch
          disabled={disabled}
          checked={checked}
          onChange={event => save && save(event.target.checked)}
        />
        <Label2>{checked ? 'Yes' : 'No'}</Label2>
      </div>
    </div>
  )
})

export default SwitchRow
