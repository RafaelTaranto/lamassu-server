import classnames from 'classnames'
import { Field, useFormikContext } from 'formik'
import * as R from 'ramda'
import React from 'react'
import RadioGroup from '../../../../../components/inputs/formik/RadioGroup'
import TextInput from '../../../../../components/inputs/formik/TextInput'
import { H4 } from '../../../../../components/typography'

const options = [
  { display: 'None', code: 'none' },
  { display: 'Email', code: 'email' },
  {
    display: 'Space separation',
    subtitle: '(e.g. first and last name)',
    code: 'spaceSeparation',
  },
]

const TextEntry = () => {
  const context = useFormikContext()
  const showErrorColor = {
    'mt-0': true,
    'text-tomato':
      !R.path(['values', 'constraintType'])(context) &&
      R.path(['errors', 'constraintType'])(context),
  }

  const getLabelInputs = () => {
    switch (context.values.constraintType) {
      case 'spaceSeparation':
        return (
          <div className="flex">
            <Field
              className="w-50 mr-2"
              component={TextInput}
              name={'inputLabel1'}
              label={'First word label'}
            />
            <Field
              className="w-50 mr-2"
              component={TextInput}
              name={'inputLabel2'}
              label={'Second word label'}
            />
          </div>
        )
      default:
        return (
          <Field
            className="w-50 mr-2"
            component={TextInput}
            name={'inputLabel1'}
            label={'Text entry label'}
          />
        )
    }
  }

  return (
    <>
      <H4 className={classnames(showErrorColor)}>Text entry constraints</H4>
      <Field
        className="flex-row"
        component={RadioGroup}
        options={options}
        name="constraintType"
      />
      {getLabelInputs()}
    </>
  )
}

export default TextEntry
