import { Form, Formik } from 'formik'
import * as R from 'ramda'
import React, { useState, Fragment } from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Modal from 'src/components/Modal'
import Stepper from 'src/components/Stepper'

import { Button } from 'src/components/buttons'

import {
  entryType,
  customElements,
  requirementElements,
  formatDates,
  REQUIREMENT,
  ID_CARD_DATA
} from './helper'

const LAST_STEP = 2

const getStep = (step, selectedValues) => {
  const elements =
    selectedValues?.entryType === REQUIREMENT &&
    !R.isNil(selectedValues?.requirement)
      ? requirementElements[selectedValues?.requirement]
      : customElements[selectedValues?.dataType]

  switch (step) {
    case 1:
      return entryType
    case 2:
      return elements
    default:
      return Fragment
  }
}

const Wizard = ({
  onClose,
  save,
  error,
  customInfoRequirementOptions,
  addCustomerData,
  addPhoto
}) => {
  const [selectedValues, setSelectedValues] = useState(null)

  const [{ step, config }, setState] = useState({
    step: 1
  })

  const isIdCardData = values => values?.requirement === ID_CARD_DATA
  const formatCustomerData = (it, newConfig) =>
    isIdCardData(newConfig) ? { [newConfig.requirement]: formatDates(it) } : it

  const isLastStep = step === LAST_STEP
  const stepOptions = getStep(step, selectedValues)

  const onContinue = async it => {
    const newConfig = R.mergeRight(config, stepOptions.schema.cast(it))
    setSelectedValues(newConfig)

    if (isLastStep) {
      switch (stepOptions.saveType) {
        case 'customerData':
          return addCustomerData(formatCustomerData(it, newConfig))
        case 'customerDataUpload':
          return addPhoto({
            newPhoto: R.head(R.values(it)),
            photoType: R.head(R.keys(it))
          })
        case 'customEntry':
          return save(newConfig)
        case 'customInfoRequirement':
          return
        // case 'customerEntryUpload':
        //   break
        default:
          break
      }
    }

    setState({
      step: step + 1,
      config: newConfig
    })
  }

  return (
    <>
      <Modal
        title="Manual data entry"
        handleClose={onClose}
        width={520}
        height={520}
        open={true}>
        <Stepper steps={LAST_STEP} currentStep={step} className="my-4" />
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize
          onSubmit={onContinue}
          initialValues={stepOptions.initialValues}
          validationSchema={stepOptions.schema}>
          {({ errors }) => (
            <Form className="h-full flex flex-col">
              <stepOptions.Component
                selectedValues={selectedValues}
                customInfoRequirementOptions={customInfoRequirementOptions}
                errors={errors}
                {...stepOptions.props}
              />
              <div className="flex mt-auto mb-6">
                {error && <ErrorMessage>Failed to save</ErrorMessage>}
                {Object.keys(errors).length > 0 && (
                  <ErrorMessage>{Object.values(errors)[0]}</ErrorMessage>
                )}
                <Button className="ml-auto" type="submit">
                  {isLastStep ? 'Add Data' : 'Next'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  )
}

export default Wizard
