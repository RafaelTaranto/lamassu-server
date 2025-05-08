import Checkbox from '@mui/material/Checkbox'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import React from 'react'
import { Label2, Info3 } from 'src/components/typography'
import WarningIcon from 'src/styling/icons/warning-icon/comet.svg?react'

import { fontSize2, fontSize3 } from 'src/styling/variables'

const CheckboxInput = ({ name, onChange, value, settings, ...props }) => {
  const { enabled, label, disabledMessage, rightSideLabel } = settings

  return (
    <>
      {enabled ? (
        <div className="flex">
          {!rightSideLabel && <Label2>{label}</Label2>}
          <Checkbox
            id={name}
            onChange={onChange}
            value={value}
            checked={value}
            icon={
              <CheckBoxOutlineBlankIcon
                style={{ marginLeft: 2, fontSize: fontSize3 }}
              />
            }
            checkedIcon={<CheckBoxIcon style={{ fontSize: fontSize2 }} />}
            disableRipple
            {...props}
          />
          {rightSideLabel && <Label2>{label}</Label2>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <WarningIcon />
          <Info3 className="flex items-center text-comet m-0 whitespace-break-spaces">
            {disabledMessage}
          </Info3>
        </div>
      )}
    </>
  )
}

export default CheckboxInput
