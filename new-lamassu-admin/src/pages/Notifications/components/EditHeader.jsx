import React from 'react'
import { H4 } from 'src/components/typography'
import DisabledEditIcon from 'src/styling/icons/action/edit/disabled.svg?react'
import EditIcon from 'src/styling/icons/action/edit/enabled.svg?react'

import { Link, IconButton } from 'src/components/buttons'

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
          disabled={disabled}
          size="large">
          {disabled ? <DisabledEditIcon /> : <EditIcon />}
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
