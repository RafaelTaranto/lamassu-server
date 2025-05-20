import classNames from 'classnames'
import React, { memo, useState } from 'react'
import { CashOut } from '../cashbox/Cashbox'

import { NumberInput } from '../base'

const CashCassetteInput = memo(
  ({ decimalPlaces, width, threshold, inputClassName, ...props }) => {
    const { name, onChange, onBlur, value } = props.field
    const { touched, errors } = props.form
    const [notes, setNotes] = useState(value)
    const error = !!(touched[name] && errors[name])
    return (
      <div className="flex">
        <CashOut
          className={classNames('h-9 mr-4', inputClassName)}
          notes={notes}
          editingMode={true}
          width={width}
          threshold={threshold}
        />
        <NumberInput
          name={name}
          onChange={e => {
            setNotes(e.target.value)
            return onChange(e)
          }}
          onBlur={onBlur}
          value={value}
          error={error}
          decimalPlaces={decimalPlaces}
          {...props}
        />
      </div>
    )
  },
)

export default CashCassetteInput
