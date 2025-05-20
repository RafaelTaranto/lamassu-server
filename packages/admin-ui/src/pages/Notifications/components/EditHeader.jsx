import IconButton from '@mui/material/IconButton'
import React from 'react'
import { H4 } from '../../../components/typography'
import DisabledEditIcon from '../../../styling/icons/action/edit/disabled.svg?react'
import EditIcon from '../../../styling/icons/action/edit/enabled.svg?react'

import { Link } from '../../../components/buttons'
import SvgIcon from '@mui/material/SvgIcon'

const Header = ({ title, editing, disabled, setEditing }) => {
  return (
    <div className="flex items-center m-0 mb-4 h-7">
      <H4 noMargin className="overflow-hidden whitespace-nowrap text-ellipsis">
        {title}
      </H4>
      {!editing && (
        <IconButton
          onClick={() => setEditing(true)}
          className="border-0 bg-transparent shrink-0 cursor-pointer ml-2"
          disabled={disabled}>
          <SvgIcon>{disabled ? <DisabledEditIcon /> : <EditIcon />}</SvgIcon>
        </IconButton>
      )}
      {editing && (
        <div className="flex ml-4 justify-between shrink-0 w-27">
          <Link color="primary" type="submit">
            Save
          </Link>
          <Link color="secondary" type="reset">
            Cancel
          </Link>
        </div>
      )}
    </div>
  )
}

export default Header
