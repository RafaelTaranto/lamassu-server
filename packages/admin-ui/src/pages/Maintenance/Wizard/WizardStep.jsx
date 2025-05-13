import classnames from 'classnames'
import { Formik, Form, Field } from 'formik'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from '../../../components/ErrorMessage'
import Stepper from '../../../components/Stepper'
import { HelpTooltip } from '../../../components/Tooltip'
import { Cashbox } from '../../../components/inputs/cashbox/Cashbox'
import { Info2, H4, P, Info1 } from '../../../components/typography'
import TxOutIcon from '../../../styling/icons/direction/cash-out.svg?react'

import { Button } from '../../../components/buttons'
import { NumberInput, RadioGroup } from '../../../components/inputs/formik'
import cashbox from '../../../styling/icons/cassettes/acceptor-left.svg'
import cassetteOne from '../../../styling/icons/cassettes/dispenser-1.svg'
import cassetteTwo from '../../../styling/icons/cassettes/dispenser-2.svg'
import tejo3CassetteOne from '../../../styling/icons/cassettes/tejo/3-cassettes/3-cassettes-open-1-left.svg'
import tejo3CassetteTwo from '../../../styling/icons/cassettes/tejo/3-cassettes/3-cassettes-open-2-left.svg'
import tejo3CassetteThree from '../../../styling/icons/cassettes/tejo/3-cassettes/3-cassettes-open-3-left.svg'
import tejo4CassetteOne from '../../../styling/icons/cassettes/tejo/4-cassettes/4-cassettes-open-1-left.svg'
import tejo4CassetteTwo from '../../../styling/icons/cassettes/tejo/4-cassettes/4-cassettes-open-2-left.svg'
import tejo4CassetteThree from '../../../styling/icons/cassettes/tejo/4-cassettes/4-cassettes-open-3-left.svg'
import tejo4CassetteFour from '../../../styling/icons/cassettes/tejo/4-cassettes/4-cassettes-open-4-left.svg'
import { getCashUnitCapacity } from '../../../utils/machine'
import { numberToFiatAmount } from '../../../utils/number'
import { startCase } from '../../../utils/string'
import classes from './WizardStep.module.css'

const CASHBOX_STEP = 1

const isCashboxStep = step => step === CASHBOX_STEP
const isCassetteStep = (step, numberOfCassettes) =>
  step > 1 && step <= numberOfCassettes + 1
const isRecyclerStep = (step, numberOfCassettes, numberOfRecyclers) =>
  step > numberOfCassettes + 1 &&
  step <= numberOfCassettes + numberOfRecyclers + 1

const cassetesArtworks = (step, numberOfCassettes, numberOfRecyclers) => {
  const cassetteStepsStart = CASHBOX_STEP + 1
  return isCassetteStep(step, numberOfCassettes)
    ? [
        [cassetteOne],
        [cassetteOne, cassetteTwo],
        [tejo3CassetteOne, tejo3CassetteTwo, tejo3CassetteThree],
        [
          tejo4CassetteOne,
          tejo4CassetteTwo,
          tejo4CassetteThree,
          tejo4CassetteFour,
        ],
      ][numberOfCassettes - 1][step - cassetteStepsStart]
    : [
        /* TODO: Recycler artwork */
        [cassetteOne],
        [cassetteOne, cassetteTwo],
        [tejo3CassetteOne, tejo3CassetteTwo, tejo3CassetteThree],
        [
          tejo4CassetteOne,
          tejo4CassetteTwo,
          tejo4CassetteThree,
          tejo4CassetteFour,
        ],
      ][numberOfRecyclers - 1][step - cassetteStepsStart]
}

const getCashUnitFieldName = (step, numberOfCassettes, numberOfRecyclers) => {
  if (isCashboxStep(step)) return { name: 'cashbox', category: 'cashbox' }
  const cassetteStepsStart = CASHBOX_STEP + 1
  if (isCassetteStep(step, numberOfCassettes))
    return {
      name: `cassette${step - cassetteStepsStart + 1}`,
      category: 'cassette',
    }
  const recyclerStepsStart = CASHBOX_STEP + numberOfCassettes + 1
  if (isRecyclerStep(step, numberOfCassettes, numberOfRecyclers))
    return {
      name: `recycler${Math.ceil(step - recyclerStepsStart + 1)}`,
      category: 'recycler',
    }
}

const WizardStep = ({
  step,
  name,
  machine,
  cashoutSettings,
  lastStep,
  steps,
  fiatCurrency,
  onContinue,
  initialValues,
}) => {
  const label = lastStep ? 'Finish' : 'Confirm'

  const stepOneRadioOptions = [
    { display: 'Yes', code: 'YES' },
    { display: 'No', code: 'NO' },
  ]

  const numberOfCassettes = machine.numberOfCassettes
  const numberOfRecyclers = machine.numberOfRecyclers
  const { name: cashUnitField, category: cashUnitCategory } =
    getCashUnitFieldName(step, numberOfCassettes, numberOfRecyclers)
  const originalCashUnitCount = machine?.cashUnits?.[cashUnitField]
  const cashUnitDenomination = cashoutSettings?.[cashUnitField]

  const cassetteCount = values => values[cashUnitField] || originalCashUnitCount
  const cassetteTotal = values => cassetteCount(values) * cashUnitDenomination
  const getPercentage = R.pipe(
    cassetteCount,
    count =>
      100 * (count / getCashUnitCapacity(machine.model, cashUnitCategory)),
    R.clamp(0, 100),
  )

  return (
    <div className="flex flex-col flex-1 pb-6 gap-6">
      <div className="mb-4">
        <Info2 noMargin className="mb-3">
          {name}
        </Info2>
        <Stepper steps={steps.length} currentStep={step} />
      </div>

      {isCashboxStep(step) && (
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={onContinue}
          initialValues={{ wasCashboxEmptied: '' }}
          enableReinitialize
          validationSchema={steps[0].schema}>
          {({ errors }) => (
            <Form className="flex flex-col flex-1">
              <div className="flex flex-row pb-25">
                <img
                  className={classes.stepImage}
                  alt={cashUnitCategory}
                  src={cashbox}></img>
                <div className={classes.formWrapper}>
                  <div className={classes.verticalAlign}>
                    <H4 noMargin>Did you empty the cash box?</H4>
                    <Field
                      component={RadioGroup}
                      name="wasCashboxEmptied"
                      options={stepOneRadioOptions}
                      className={classes.horizontalAlign}
                    />
                    {errors.wasCashboxEmptied && (
                      <div className="text-tomato">
                        {errors.wasCashboxEmptied}
                      </div>
                    )}
                    <div
                      className={classnames(
                        classes.horizontalAlign,
                        'items-center',
                      )}>
                      <P>Since previous update</P>
                      <HelpTooltip width={215}>
                        <P>
                          Number of bills inside the cash box, since the last
                          cash box changes.
                        </P>
                      </HelpTooltip>
                    </div>
                    <div
                      className={classnames(
                        classes.horizontalAlign,
                        'items-baseline',
                      )}>
                      <Info1 noMargin className="mr-1">
                        {machine?.cashUnits.cashbox}
                      </Info1>
                      <P noMargin>accepted bills</P>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="mt-auto ml-auto" type="submit">
                {label}
              </Button>
            </Form>
          )}
        </Formik>
      )}

      {!isCashboxStep(step) && (
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={onContinue}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={steps[step - 1].schema}>
          {({ values, errors }) => (
            <Form className="flex flex-col flex-1">
              <div className={classnames(classes.horizontalAlign, 'pb-6')}>
                <img
                  className={classes.stepImage}
                  alt={cashUnitCategory}
                  src={cassetesArtworks(
                    step,
                    numberOfCassettes,
                    numberOfRecyclers,
                  )}></img>
                <div className={classes.formWrapper}>
                  <div className={classes.verticalAlign}>
                    <div
                      className={classnames(classes.horizontalAlign, 'mb-6')}>
                      <div
                        className={classnames(classes.horizontalAlign, 'mt-4')}>
                        <TxOutIcon />
                        <H4 className="ml-2 mr-6" noMargin>
                          {startCase(cashUnitField)} (
                          {cashUnitCategory === 'cassette'
                            ? `dispenser`
                            : cashUnitCategory === 'recycler'
                              ? `recycler`
                              : ``}
                          )
                        </H4>
                      </div>
                      <Cashbox
                        className="h-10 w-9"
                        percent={getPercentage(values)}
                        cashOut
                      />
                    </div>
                    <H4 noMargin>Refill bill count</H4>
                    <div
                      className={classnames(
                        classes.horizontalAlign,
                        'items-baseline',
                      )}>
                      <Field
                        component={NumberInput}
                        decimalPlaces={0}
                        width={50}
                        placeholder={originalCashUnitCount.toString()}
                        name={cashUnitField}
                        className="mr-1"
                        autoFocus
                      />
                      <P>
                        {cashUnitDenomination} {fiatCurrency} bills loaded
                      </P>
                    </div>
                    <P noMargin className="text-comet">
                      = {numberToFiatAmount(cassetteTotal(values))}{' '}
                      {fiatCurrency}
                    </P>
                    {!R.isEmpty(errors) && (
                      <ErrorMessage className="max-w-68 mt-6">
                        {R.head(R.values(errors))}
                      </ErrorMessage>
                    )}
                  </div>
                </div>
              </div>
              <Button className="ml-auto mt-auto" type="submit">
                {label}
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default WizardStep
