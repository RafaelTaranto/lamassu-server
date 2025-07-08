import { Form, Formik, useFormikContext } from 'formik'
import * as R from 'ramda'
import React, { useState, Fragment, useEffect } from 'react'
import ErrorMessage from '../../components/ErrorMessage'
import Modal from '../../components/Modal'
import Stepper from '../../components/Stepper'
import { H5, Info3 } from '../../components/typography'

import { Button } from '../../components/buttons'
import { singularOrPlural } from '../../utils/string'

import { type, requirements } from './helper'

const LAST_STEP = 2

const getStep = (
  { step, config },
  currency,
  customInfoRequests,
  complianceServices,
  emailAuth,
  triggers,
) => {
  switch (step) {
    // case 1:
    //   return txDirection
    case 1:
      return type(currency)
    case 2:
      return requirements(
        config,
        triggers,
        customInfoRequests,
        complianceServices,
        emailAuth,
      )
    default:
      return Fragment
  }
}

const getText = (step, config, currency) => {
  switch (step) {
    // case 1:
    //   return `In ${getDirectionText(config)} transactions`
    case 1:
      return <>If the user {getTypeText(config, currency)}</>
    case 2:
      return <>the user will be {getRequirementText(config)}.</>
    default:
      return <></>
  }
}

const orUnderline = value => {
  const blankSpaceEl = (
    <span className="py-0 px-7 my-0 mx-1 border-b-1 border-b-comet inline-block"></span>
  )
  return R.isEmpty(value) || R.isNil(value) ? blankSpaceEl : value
}

// const getDirectionText = config => {
//   switch (config.direction) {
//     case 'both':
//       return 'both cash-in and cash-out'
//     case 'cashIn':
//       return 'cash-in'
//     case 'cashOut':
//       return 'cash-out'
//     default:
//       return orUnderline(null)
//   }
// }

const getTypeText = (config, currency) => {
  switch (config.triggerType) {
    case 'txAmount':
      return (
        <>
          makes a single transaction over{' '}
          {orUnderline(config.threshold.threshold)} {currency}
        </>
      )
    case 'txVolume':
      return (
        <>
          makes more than {orUnderline(config.threshold.threshold)} {currency}{' '}
          worth of transactions within{' '}
          {orUnderline(config.threshold.thresholdDays)}{' '}
          {singularOrPlural(config.threshold.thresholdDays, 'day', 'days')}
        </>
      )
    case 'txVelocity':
      return (
        <>
          makes more than {orUnderline(config.threshold.threshold)}{' '}
          {singularOrPlural(
            config.threshold.threshold,
            'transaction',
            'transactions',
          )}{' '}
          in {orUnderline(config.threshold.thresholdDays)}{' '}
          {singularOrPlural(config.threshold.thresholdDays, 'day', 'days')}
        </>
      )
    case 'consecutiveDays':
      return (
        <>
          at least one transaction every day for{' '}
          {orUnderline(config.threshold.thresholdDays)}{' '}
          {singularOrPlural(config.threshold.thresholdDays, 'day', 'days')}
        </>
      )
    default:
      return <></>
  }
}

const getRequirementText = config => {
  switch (config.requirement?.requirementType) {
    case 'email':
      return <>asked to enter code provided through email verification</>
    case 'sms':
      return <>asked to enter code provided through SMS verification</>
    case 'idCardPhoto':
      return <>asked to scan a ID with photo</>
    case 'idCardData':
      return <>asked to scan a ID</>
    case 'facephoto':
      return <>asked to have a photo taken</>
    case 'usSsn':
      return <>asked to input his social security number</>
    case 'sanctions':
      return <>matched against the OFAC sanctions list</>
    case 'superuser':
      return <></>
    case 'suspend':
      return (
        <>
          suspended for {orUnderline(config.requirement.suspensionDays)}{' '}
          {singularOrPlural(config.requirement.suspensionDays, 'day', 'days')}
        </>
      )
    case 'block':
      return <>blocked</>
    case 'custom':
      return <>asked to fulfill a custom requirement</>
    case 'external':
      return <>redirected to an external verification process</>
    default:
      return orUnderline(null)
  }
}

const InfoPanel = ({ step, config = {}, liveValues = {}, currency }) => {
  const oldText = R.range(1, step).map((it, idx) => (
    <React.Fragment key={idx}>{getText(it, config, currency)}</React.Fragment>
  ))
  const newText = getText(step, liveValues, currency)
  const isLastStep = step === LAST_STEP

  return (
    <>
      <H5 className="my-5 mx-0">Trigger overview so far</H5>
      <Info3 noMargin>
        {oldText}
        {step !== 1 && ', '}
        <span className="text-comet">{newText}</span>
        {!isLastStep && '...'}
      </Info3>
    </>
  )
}

const GetValues = ({ setValues }) => {
  const { values } = useFormikContext()
  useEffect(() => {
    setValues && values && setValues(values)
  }, [setValues, values])

  return null
}

const Wizard = ({
  onClose,
  save,
  error,
  currency,
  customInfoRequests,
  complianceServices,
  emailAuth,
  triggers,
}) => {
  const [liveValues, setLiveValues] = useState({})
  const [{ step, config }, setState] = useState({
    step: 1,
  })

  const isLastStep = step === LAST_STEP
  const stepOptions = getStep(
    { step, config },
    currency,
    customInfoRequests,
    complianceServices,
    emailAuth,
    triggers,
  )

  const onContinue = async it => {
    const newConfig = R.mergeRight(config, stepOptions.schema.cast(it))

    if (isLastStep) {
      return save(newConfig)
    }

    setState({
      step: step + 1,
      config: newConfig,
    })
  }

  const createErrorMessage = (errors, touched, values) => {
    const triggerType = values?.triggerType
    const containsType = R.includes(triggerType)
    const isSuspend = values?.requirement?.requirementType === 'suspend'
    const isCustom = values?.requirement?.requirementType === 'custom'

    const hasRequirementError = requirements().hasRequirementError(
      errors,
      touched,
      values,
    )
    const hasCustomRequirementError = requirements().hasCustomRequirementError(
      errors,
      touched,
      values,
    )

    const hasAmountError =
      !!errors.threshold &&
      !!touched.threshold?.threshold &&
      !containsType(['consecutiveDays']) &&
      (!values.threshold?.threshold || values.threshold?.threshold < 0)

    const hasDaysError =
      !!errors.threshold &&
      !!touched.threshold?.thresholdDays &&
      !containsType(['txAmount']) &&
      (!values.threshold?.thresholdDays || values.threshold?.thresholdDays < 0)

    if (containsType(['txAmount', 'txVolume', 'txVelocity']) && hasAmountError)
      return errors.threshold

    if (
      containsType(['txVolume', 'txVelocity', 'consecutiveDays']) &&
      hasDaysError
    )
      return errors.threshold

    if (
      (isSuspend && hasRequirementError) ||
      (isCustom && hasCustomRequirementError)
    )
      return errors.requirement
  }

  return (
    <>
      <Modal
        title="New compliance trigger"
        handleClose={onClose}
        width={560}
        height={520}
        infoPanel={
          <InfoPanel
            currency={currency}
            step={step}
            config={config}
            liveValues={liveValues}
          />
        }
        infoPanelHeight={172}
        open={true}>
        <Stepper className="my-4 mx-0" steps={LAST_STEP} currentStep={step} />
        <Formik
          validateOnBlur={false}
          validateOnChange={true}
          enableReinitialize
          onSubmit={onContinue}
          initialValues={stepOptions.initialValues}
          validationSchema={stepOptions.schema}>
          {({ errors, touched, values }) => (
            <Form className="h-full flex flex-col">
              <GetValues setValues={setLiveValues} />
              <stepOptions.Component {...stepOptions.props} />
              <div className="flex flex-row mt-auto mx-0 mb-6">
                {error && <ErrorMessage>Failed to save</ErrorMessage>}
                {createErrorMessage(errors, touched, values) && (
                  <ErrorMessage>
                    {createErrorMessage(errors, touched, values)}
                  </ErrorMessage>
                )}
                <Button className="ml-auto" type="submit">
                  {isLastStep ? 'Finish' : 'Next'}
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
