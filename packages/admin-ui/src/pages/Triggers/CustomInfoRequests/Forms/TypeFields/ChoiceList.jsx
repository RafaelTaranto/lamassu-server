import classnames from 'classnames'
import { Field, useFormikContext, FieldArray } from 'formik'
import * as R from 'ramda'
import React, { useEffect, useRef } from 'react'
import Button from '../../../../../components/buttons/ActionButton'
import RadioGroup from '../../../../../components/inputs/formik/RadioGroup'
import TextInput from '../../../../../components/inputs/formik/TextInput'
import { H4 } from '../../../../../components/typography'
import AddIconInverse from '../../../../../styling/icons/button/add/white.svg?react'
import AddIcon from '../../../../../styling/icons/button/add/zodiac.svg?react'

const nonEmptyStr = obj => obj.text && obj.text.length

const options = [
  { display: 'Select just one', code: 'selectOne' },
  { display: 'Select multiple', code: 'selectMultiple' },
]

const ChoiceList = () => {
  const context = useFormikContext()
  const choiceListRef = useRef(null)
  const listChoices = R.path(['values', 'listChoices'])(context) ?? []
  const choiceListError = R.path(['errors', 'listChoices'])(context) ?? false

  const showErrorColor = {
    'mb-0': true,
    'text-tomato':
      !R.path(['values', 'constraintType'])(context) &&
      R.path(['errors', 'constraintType'])(context),
  }

  const hasError = choice => {
    return (
      choiceListError &&
      R.filter(nonEmptyStr)(listChoices).length < 2 &&
      choice.text.length === 0
    )
  }

  useEffect(() => {
    scrollToBottom()
  }, [listChoices.length])

  const scrollToBottom = () => {
    choiceListRef.current?.scrollIntoView()
  }

  return (
    <>
      <H4 className={classnames(showErrorColor)}>Choice list constraints</H4>
      <Field
        component={RadioGroup}
        options={options}
        className="flex-col"
        name="constraintType"
      />
      <FieldArray name="listChoices">
        {({ push }) => {
          return (
            <div className="flex flex-col">
              <H4 className="mb-0">Choices</H4>
              <div className="flex flex-col max-h-60">
                {listChoices.map((choice, idx) => {
                  return (
                    <div ref={choiceListRef} key={idx}>
                      <Field
                        className="w-105"
                        error={hasError(choice)}
                        component={TextInput}
                        name={`listChoices[${idx}].text`}
                        label={`Choice ${idx + 1}`}
                      />
                    </div>
                  )
                })}
              </div>
              <Button
                Icon={AddIcon}
                color="primary"
                InverseIcon={AddIconInverse}
                className="w-30 h-7 mt-7"
                onClick={e => {
                  e.preventDefault()
                  return push({ text: '' })
                }}>
                Add choice
              </Button>
            </div>
          )
        }}
      </FieldArray>
    </>
  )
}

export default ChoiceList
