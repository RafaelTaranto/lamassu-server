import classnames from 'classnames'
import { Field, useFormikContext } from 'formik'
import * as R from 'ramda'
import React from 'react'
import NumberInput from '../../../../../components/inputs/formik/NumberInput'
import RadioGroup from '../../../../../components/inputs/formik/RadioGroup'
import { TL1, H4 } from '../../../../../components/typography'

const options = [
  { display: 'None', code: 'none' },
  { display: 'Date', code: 'date' },
  { display: 'Length', code: 'length' },
]

const NumericalEntry = () => {
  const context = useFormikContext()

  const isLength =
    (R.path(['values', 'constraintType'])(useFormikContext()) ?? null) ===
    'length'

  const showErrorColor = {
    'mb-0': true,
    'text-tomat':
      !R.path(['values', 'constraintType'])(context) &&
      R.path(['errors', 'constraintType'])(context),
  }

  return (
    <>
      <H4 className={classnames(showErrorColor)}>
        Numerical entry constraints
      </H4>
      <Field
        className="flex-row"
        component={RadioGroup}
        options={options}
        name="constraintType"
      />
      {isLength && (
        <div className="flex mt-6 max-w-29">
          <Field
            component={NumberInput}
            name={'inputLength'}
            label={'Length'}
            decimalPlaces={0}
            allowNegative={false}
          />
          <TL1 className="ml-2 mt-6">digits</TL1>
        </div>
      )}
    </>
  )
}

export default NumericalEntry
