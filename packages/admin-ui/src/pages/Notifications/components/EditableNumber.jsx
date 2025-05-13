import classnames from 'classnames'
import { useFormikContext, Field as FormikField } from 'formik'
import React from 'react'
import { Label1, Info1, TL2 } from '../../../components/typography'

import { NumberInput } from '../../../components/inputs/formik'

const EditableNumber = ({
  label,
  name,
  editing,
  displayValue,
  decoration,
  className,
  decimalPlaces = 0,
  width = 80,
}) => {
  const { values } = useFormikContext()

  const classNames = {
    'h-13': true,
    className,
  }

  return (
    <div className={classnames(classNames)}>
      {label && <Label1 noMargin>{label}</Label1>}
      <div className="flex items-baseline">
        {!editing && (
          <Info1 noMargin className="my-2">
            {displayValue(values[name])}
          </Info1>
        )}
        {editing && (
          <FormikField
            id={name}
            size="lg"
            fullWidth
            name={name}
            component={NumberInput}
            textAlign="right"
            width={width}
            decimalPlaces={decimalPlaces}
          />
        )}
        <TL2 noMargin className="ml-2">
          {decoration}
        </TL2>
      </div>
    </div>
  )
}

export default EditableNumber
