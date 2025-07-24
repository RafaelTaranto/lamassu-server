import classnames from 'classnames'
import { Field, useFormikContext } from 'formik'
import * as R from 'ramda'
import React from 'react'
import { H4, Info1 } from '../../components/typography'
import * as Yup from 'yup'

import {
  NumberInput,
  RadioGroup,
  Dropdown,
} from '../../components/inputs/formik'
import { transformNumber } from '../../utils/number'
import { onlyFirstToUpper } from '../../utils/string'

const typeSchema = Yup.object()
  .shape({
    triggerType: Yup.string('The trigger type must be a string').required(
      'The trigger type is required',
    ),
    threshold: Yup.object({
      threshold: Yup.number().transform(transformNumber).nullable(),
      thresholdDays: Yup.number().transform(transformNumber).nullable(),
    }),
  })
  .test(({ threshold, triggerType }, context) => {
    const errorMessages = {
      txAmount: () => 'Amount must be greater than or equal to 0',
      txVolume: threshold => {
        const thresholdMessage = 'Volume must be greater than or equal to 0'
        const thresholdDaysMessage = 'Days must be greater than 0'
        const message = []
        if (!threshold.threshold || threshold.threshold < 0)
          message.push(thresholdMessage)
        if (!threshold.thresholdDays || threshold.thresholdDays <= 0)
          message.push(thresholdDaysMessage)
        return message.join(', ')
      },
      txVelocity: threshold => {
        const thresholdMessage = 'Transactions must be greater than 0'
        const thresholdDaysMessage = 'Days must be greater than 0'
        const message = []
        if (!threshold.threshold || threshold.threshold <= 0)
          message.push(thresholdMessage)
        if (!threshold.thresholdDays || threshold.thresholdDays <= 0)
          message.push(thresholdDaysMessage)
        return message.join(', ')
      },
      consecutiveDays: () => 'Days must be greater than 0',
    }
    const thresholdValidator = {
      txAmount: threshold => threshold.threshold >= 0,
      txVolume: threshold =>
        threshold.threshold >= 0 && threshold.thresholdDays > 0,
      txVelocity: threshold =>
        threshold.threshold > 0 && threshold.thresholdDays > 0,
      consecutiveDays: threshold => threshold.thresholdDays > 0,
    }

    if (!triggerType) return

    if (triggerType && thresholdValidator[triggerType](threshold)) return

    return context.createError({
      path: 'threshold',
      message: errorMessages[triggerType](threshold),
    })
  })

const typeOptions = [
  { display: 'Transaction amount', code: 'txAmount' },
  {
    display: 'Transaction volume',
    code: 'txVolume',
  },
  { display: 'Transaction velocity', code: 'txVelocity' },
  { display: 'Consecutive days', code: 'consecutiveDays' },
]

const Type = ({ ...props }) => {
  const { errors, touched, values, setTouched, handleChange } =
    useFormikContext()

  const typeClass = {
    'text-tomato': errors.triggerType && touched.triggerType,
  }

  const containsType = R.includes(values?.triggerType)
  const isThresholdCurrencyEnabled = containsType(['txAmount', 'txVolume'])
  const isTransactionAmountEnabled = containsType(['txVelocity'])
  const isThresholdDaysEnabled = containsType(['txVolume', 'txVelocity'])
  const isConsecutiveDaysEnabled = containsType(['consecutiveDays'])

  const hasAmountError =
    !!errors.threshold &&
    !!touched.threshold?.threshold &&
    !isConsecutiveDaysEnabled &&
    (!values.threshold?.threshold || values.threshold?.threshold < 0)
  const hasDaysError =
    !!errors.threshold &&
    !!touched.threshold?.thresholdDays &&
    !containsType(['txAmount']) &&
    (!values.threshold?.thresholdDays || values.threshold?.thresholdDays < 0)

  const triggerTypeError = !!(hasDaysError || hasAmountError)

  const thresholdClass = {
    'text-tomato': triggerTypeError,
  }

  const isRadioGroupActive = () => {
    return (
      isThresholdCurrencyEnabled ||
      isTransactionAmountEnabled ||
      isThresholdDaysEnabled ||
      isConsecutiveDaysEnabled
    )
  }

  return (
    <>
      <div className="flex items-center">
        <H4 className={classnames(typeClass)}>Choose trigger type</H4>
      </div>
      <Field
        component={RadioGroup}
        name="triggerType"
        options={typeOptions}
        labelClassName="h-10 py-0 px-3"
        radioClassName="p-1 m-1"
        className="flex-row"
        onChange={e => {
          handleChange(e)
          setTouched({
            threshold: false,
            thresholdDays: false,
          })
        }}
      />

      <div className="flex flex-col">
        {isRadioGroupActive() && (
          <H4 className={classnames(thresholdClass, 'mt-12')}>Threshold</H4>
        )}
        <div className="flex flex-row">
          {isThresholdCurrencyEnabled && (
            <>
              <Field
                className="mr-2 w-19"
                component={NumberInput}
                size="lg"
                name="threshold.threshold"
                error={hasAmountError}
              />
              <Info1 className="mt-2">{props.currency}</Info1>
            </>
          )}
          {isTransactionAmountEnabled && (
            <>
              <Field
                className="mr-2 w-19"
                component={NumberInput}
                size="lg"
                name="threshold.threshold"
                error={hasAmountError}
              />
              <Info1 className="mt-2">transactions</Info1>
            </>
          )}
          {isThresholdDaysEnabled && (
            <>
              <Info1 className={classnames(typeClass, 'mx-2 mt-2')}>in</Info1>
              <Field
                className="mr-2 w-19"
                component={NumberInput}
                size="lg"
                name="threshold.thresholdDays"
                error={hasDaysError}
              />
              <Info1 className="mt-2">days</Info1>
            </>
          )}
          {isConsecutiveDaysEnabled && (
            <>
              <Field
                className="mr-2 w-19"
                component={NumberInput}
                size="lg"
                name="threshold.thresholdDays"
                error={hasDaysError}
              />
              <Info1 className="mt-2">consecutive days</Info1>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const typeStep = currency => ({
  schema: typeSchema,
  options: typeOptions,
  Component: Type,
  props: { currency },
  initialValues: {
    triggerType: '',
    threshold: { threshold: '', thresholdDays: '' },
  },
})

const requirementSchema = Yup.object()
  .shape({
    requirement: Yup.object({
      requirementType: Yup.string().required(),
      suspensionDays: Yup.number().when('requirementType', {
        is: value => value === 'suspend',
        then: schema => schema.nullable().transform(transformNumber),
        otherwise: schema => schema.nullable().transform(() => null),
      }),
      customInfoRequestId: Yup.string().when('requirementType', {
        is: value => value !== 'custom',
        then: schema => schema.nullable().transform(() => null),
      }),
      externalService: Yup.string().when('requirementType', {
        is: value => value !== 'external',
        then: schema => schema.nullable().transform(() => null),
      }),
    }).required(),
  })
  .test(({ requirement }, context) => {
    const requirementValidator = (requirement, type) => {
      switch (type) {
        case 'suspend':
          return requirement.requirementType === type
            ? requirement.suspensionDays > 0
            : true
        case 'custom':
          return requirement.requirementType === type
            ? !R.isNil(requirement.customInfoRequestId)
            : true
        case 'external':
          return requirement.requirementType === type
            ? !R.isNil(requirement.externalService)
            : true
        default:
          return true
      }
    }

    if (requirement && !requirementValidator(requirement, 'suspend'))
      return context.createError({
        path: 'requirement',
        message: 'Suspension days must be greater than 0',
      })

    if (requirement && !requirementValidator(requirement, 'custom'))
      return context.createError({
        path: 'requirement',
        message: 'You must select an item',
      })

    if (requirement && !requirementValidator(requirement, 'external'))
      return context.createError({
        path: 'requirement',
        message: 'You must select an item',
      })
  })

const requirementOptions = [
  { display: 'SMS verification', code: 'sms' },
  {
    display: 'Email verification',
    code: 'email',
  },
  { display: 'ID card image', code: 'idCardPhoto' },
  {
    display: 'ID data',
    code: 'idCardData',
  },
  { display: 'Customer camera', code: 'facephoto' },
  { display: 'Sanctions', code: 'sanctions' },
  {
    display: 'US SSN',
    code: 'usSsn',
  }, // { display: 'Super user', code: 'superuser' },
  { display: 'Suspend', code: 'suspend' },
  { display: 'Block', code: 'block' },
  {
    display: 'External verification',
    code: 'external',
  },
]

const hasRequirementError = (errors, touched, values) =>
  !!errors.requirement &&
  !!touched.requirement?.suspensionDays &&
  (!values.requirement?.suspensionDays ||
    values.requirement?.suspensionDays < 0)

const hasCustomRequirementError = (errors, touched, values) =>
  !!errors.requirement &&
  !!touched.requirement?.customInfoRequestId &&
  (!values.requirement?.customInfoRequestId ||
    !R.isNil(values.requirement?.customInfoRequestId))

const hasExternalRequirementError = (errors, touched, values) =>
  !!errors.requirement &&
  !!touched.requirement?.externalService &&
  !values.requirement?.externalService

const Requirement = ({
  config = {},
  triggers,
  emailAuth,
  complianceServices,
  customInfoRequests = [],
}) => {
  const { touched, errors, values, handleChange, setTouched } =
    useFormikContext()

  const isSuspend = values?.requirement?.requirementType === 'suspend'
  const isCustom = values?.requirement?.requirementType === 'custom'
  const isExternal = values?.requirement?.requirementType === 'external'

  const customRequirementsInUse = R.reduce(
    (acc, value) => {
      if (value.requirement.requirementType === 'custom')
        acc.push({
          triggerType: value.triggerType,
          id: value.requirement.customInfoRequestId,
        })
      return acc
    },
    [],
    triggers,
  )

  const availableCustomRequirements = R.filter(
    it =>
      !R.includes(
        {
          triggerType: config.triggerType,
          id: it.id,
        },
        customRequirementsInUse,
      ),
    customInfoRequests,
  )

  const makeCustomReqOptions = () =>
    availableCustomRequirements.map(it => ({
      value: it.id,
      display: it.customRequest.name,
    }))

  const enableCustomRequirement = !R.isEmpty(availableCustomRequirements)

  const customInfoOption = {
    display: 'Custom information requirement',
    code: 'custom',
  }

  const itemToRemove = emailAuth ? 'sms' : 'email'
  const reqOptions = requirementOptions.filter(it => it.code !== itemToRemove)
  const options = R.clone(reqOptions)

  enableCustomRequirement && options.push(customInfoOption)

  const titleClass = {
    'text-tomato':
      (!!errors.requirement && !isSuspend && !isCustom && !isExternal) ||
      (isSuspend && hasRequirementError(errors, touched, values)) ||
      (isCustom && hasCustomRequirementError(errors, touched, values)) ||
      (isExternal && hasExternalRequirementError(errors, touched, values)),
  }

  return (
    <>
      <div className="flex items-center">
        <H4 className={classnames(titleClass)}>Choose a requirement</H4>
      </div>
      <Field
        component={RadioGroup}
        name="requirement.requirementType"
        options={options}
        labelClassName="h-10 p-0"
        radioClassName="p-1 m-1"
        className="flex-row grid grid-cols-[182px_162px_181px]"
        onChange={e => {
          handleChange(e)
          setTouched({
            suspensionDays: false,
          })
        }}
      />
      {isSuspend && (
        <Field
          className="mr-2 w-19"
          component={NumberInput}
          label="Days"
          size="lg"
          name="requirement.suspensionDays"
          error={hasRequirementError(errors, touched, values)}
        />
      )}
      {isCustom && (
        <div>
          <Field
            className="mt-4 min-w-[155px]"
            component={Dropdown}
            label="Available requests"
            name="requirement.customInfoRequestId"
            options={makeCustomReqOptions()}
          />
        </div>
      )}
      {isExternal && (
        <div className="flex flex-col gap-4">
          <Field
            className="mt-4 w-[155px]"
            component={Dropdown}
            label="Service"
            name="requirement.externalService"
            options={complianceServices.map(it => ({
              value: it.code,
              display: it.display,
            }))}
          />
        </div>
      )}
    </>
  )
}

const requirementsStep = (
  config,
  customInfoRequests,
  complianceServices,
  emailAuth,
) => ({
  schema: requirementSchema,
  options: requirementOptions,
  Component: Requirement,
  props: {
    config,
    customInfoRequests,
    emailAuth,
    complianceServices,
  },
  hasRequirementError: hasRequirementError,
  hasCustomRequirementError: hasCustomRequirementError,
  hasExternalRequirementError: hasExternalRequirementError,
  initialValues: {
    requirement: {
      requirementType: '',
      suspensionDays: '',
      customInfoRequestId: null,
      externalService: null,
    },
  },
})

const getView = (data, code, compare) => it => {
  if (!data) return ''

  return R.compose(R.prop(code), R.find(R.propEq(it, compare ?? 'code')))(data)
}

const customReqIdMatches = customReqId => it => {
  return it.id === customReqId
}

const triggerTypeRender = ({ cell }) =>
  getView(typeOptions, 'display')(cell.getValue())

const requirementTypeRender =
  customInfoRequests =>
  ({ row }) => {
    const { requirementType, customInfoRequestId, externalService } =
      row.original
    switch (requirementType) {
      case 'custom':
        return (
          customInfoRequests.find(customReqIdMatches(customInfoRequestId))
            ?.customRequest?.name ?? ''
        )
      case 'external':
        return `External verification (${onlyFirstToUpper(externalService)})`
      default:
        return getView(requirementOptions, 'display')(requirementType)
    }
  }

const DisplayThreshold =
  currency =>
  ({ cell, row }) => {
    const [threshold, thresholdDays] = cell.getValue()
    const { triggerType } = row.original

    switch (triggerType) {
      case 'txAmount':
        return `${threshold} ${currency}`
      case 'txVolume':
        return `${threshold} ${currency} in ${thresholdDays} days`
      case 'txVelocity':
        return `${threshold} transactions in ${thresholdDays} days`
      case 'consecutiveDays':
        return `${thresholdDays} days`
    }
  }

const getElements = (currency, customInfoRequests) => [
  {
    header: 'Trigger type',
    accessorKey: 'triggerType',
    size: 200,
    Cell: triggerTypeRender,
  },
  {
    header: 'Requirement type',
    accessorKey: 'requirementType',
    size: 260,
    Cell: requirementTypeRender(customInfoRequests),
  },
  {
    header: 'Threshold',
    accessorFn({ triggerType, threshold, thresholdDays }) {
      return [
        ['txAmount', 'txVolume', 'txVelocity'].includes(triggerType)
          ? threshold
          : null,
        ['txVolume', 'txVelocity', 'consecutiveDays'].includes(triggerType)
          ? thresholdDays
          : null,
      ]
    },
    size: 254,
    Cell: DisplayThreshold(currency),
  },
]

const triggerOrder = R.map(R.prop('code'))(typeOptions)
const sortBy = [
  R.comparator(
    (a, b) =>
      triggerOrder.indexOf(a.triggerType) < triggerOrder.indexOf(b.triggerType),
  ),
]

const fromServer = triggers => {
  return R.map(
    ({
      requirementType,
      suspensionDays,
      threshold,
      thresholdDays,
      customInfoRequestId,
      externalService,
      ...rest
    }) => ({
      requirement: {
        requirementType,
        suspensionDays,
        customInfoRequestId,
        externalService,
      },
      threshold: {
        threshold,
        thresholdDays,
      },
      ...rest,
    }),
  )(triggers)
}

const toServer = triggers =>
  R.map(({ requirement, threshold, ...rest }) => ({
    requirementType: requirement.requirementType,
    suspensionDays: requirement.suspensionDays,
    threshold: threshold.threshold,
    thresholdDays: threshold.thresholdDays,
    customInfoRequestId: requirement.customInfoRequestId,
    externalService: requirement.externalService,
    ...rest,
  }))(triggers)

export {
  typeStep,
  requirementsStep,
  sortBy,
  fromServer,
  toServer,
  getView,
  requirementOptions,
  getElements,
}
