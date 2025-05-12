import classnames from 'classnames'
import { Formik, Form, Field } from 'formik'
import * as R from 'ramda'
import React, { useReducer, useEffect } from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Stepper from 'src/components/Stepper'
import { H4, Info2 } from 'src/components/typography'
import FormRenderer from 'src/pages/Services/FormRenderer'

import { Button } from 'src/components/buttons'
import { RadioGroup, Autocomplete } from 'src/components/inputs'
import { NumberInput } from 'src/components/inputs/formik'
import { startCase } from 'src/utils/string'

const initialState = {
  form: null,
  selected: null,
  isNew: false,
  iError: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'select':
      return {
        form: null,
        selected: action.selected,
        isNew: null,
        iError: false,
      }
    case 'new':
      return { form: state.form, selected: null, isNew: true, iError: false }
    case 'form':
      return {
        form: action.form,
        selected: action.form.code,
        isNew: true,
        iError: false,
      }
    case 'error':
      return R.merge(state, { innerError: true })
    case 'reset':
      return initialState
    default:
      throw new Error()
  }
}

const WizardStep = ({
  type,
  schema: stepSchema,
  schemas,
  coin,
  name,
  error,
  step,
  maxSteps,
  lastStep,
  isLastStep,
  accounts,
  onContinue,
  fiatCurrency,
  filled,
  unfilled,
  getValue,
}) => {
  const [{ innerError, selected, form, isNew }, dispatch] = useReducer(
    reducer,
    initialState,
  )

  useEffect(() => {
    dispatch({ type: 'reset' })
  }, [step])

  const innerContinue = (config, account) => {
    if (!config || !config[type]) {
      return dispatch({ type: 'error' })
    }
    onContinue(config, account)
  }

  const label = isLastStep ? 'Finish' : 'Next'
  const displayName = name ?? type
  const subtitleClass = classnames('mt-8 mb-5 mx-0', {
    'text-tomato': innerError,
  })
  return (
    <>
      <Info2 noMargin className="mb-3">
        {startCase(displayName)}
      </Info2>
      <Stepper steps={lastStep} currentStep={step} />
      <H4 className={subtitleClass}>
        {step < maxSteps - 1
          ? `Select a ${displayName} or set up a new one`
          : `Select ${displayName} for ${coin}`}
      </H4>
      {!(isLastStep && step === maxSteps) && (
        <RadioGroup
          options={filled}
          value={selected}
          className="flex-row"
          onChange={(evt, it) => {
            dispatch({ type: 'select', selected: it })
          }}
          labelClassName="w-37 h-12"
          radioClassName="p-1 m-1"
        />
      )}
      {type === 'zeroConfLimit' && (
        <Formik
          validateOnBlur={false}
          validateOnChange={true}
          initialValues={{ zeroConfLimit: '' }}
          enableReinitialize
          validationSchema={stepSchema}>
          {({ setFieldValue }) => (
            <Form>
              <div className="flex flex-row">
                <Field
                  component={NumberInput}
                  decimalPlaces={0}
                  width={50}
                  placeholder={'0'}
                  name={`zeroConfLimit`}
                  onChange={event => {
                    dispatch({
                      type: 'select',
                      selected: event.target.value,
                    })
                    setFieldValue(event.target.id, event.target.value)
                  }}
                  className="mr-1 text-2xl font-mont font-normal"
                />
                <Info2>{fiatCurrency}</Info2>
              </div>
            </Form>
          )}
        </Formik>
      )}
      <div className="flex items-center h-12">
        {!R.isEmpty(unfilled) && !R.isNil(unfilled) && (
          <RadioGroup
            value={isNew}
            onChange={() => {
              dispatch({ type: 'new' })
            }}
            labelClassName="w-[150px] h-12"
            radioClassName="p-1 m-1"
            options={[{ display: 'Set up new', code: true }]}
          />
        )}
        {isNew && (
          <Autocomplete
            fullWidth
            label={`Select ${displayName}`}
            className="w-[150px]"
            isOptionEqualToValue={R.eqProps('code')}
            labelProp={'display'}
            options={unfilled}
            onChange={(evt, it) => {
              dispatch({ type: 'form', form: it })
            }}
          />
        )}
      </div>
      {form && (
        <FormRenderer
          save={it => innerContinue({ [type]: form.code }, { [form.code]: it })}
          elements={schemas[form.code].elements}
          validationSchema={schemas[form.code].getValidationSchema(
            accounts[form.code],
          )}
          value={getValue(form.code)}
          buttonLabel={label}
        />
      )}
      {!form && (
        <div className="flex flex-row ml-auto mt-auto mb-6">
          {error && <ErrorMessage>Failed to save</ErrorMessage>}
          <Button
            className="ml-auto"
            onClick={() => innerContinue({ [type]: selected })}>
            {label}
          </Button>
        </div>
      )}
    </>
  )
}

export default WizardStep
