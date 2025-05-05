import { Field, Form, Formik } from 'formik'
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Modal from 'src/components/Modal'
import { H1 } from 'src/components/typography'
import * as Yup from 'yup'

import { Button } from 'src/components/buttons'
import { TextInput } from 'src/components/inputs/formik'

const getValidationSchema = countryCodes =>
  Yup.object().shape({
    phoneNumber: Yup.string()
      .required('A phone number is required')
      .test('is-valid-number', 'That is not a valid phone number', value => {
        try {
          return countryCodes.some(countryCode =>
            parsePhoneNumberWithError(value, countryCode).isValid()
          )
        } catch (e) {
          return false
        }
      })
      .trim()
  })

const formatPhoneNumber = (countryCodes, numberStr) => {
  const matchedCountry = R.find(it => {
    const number = parsePhoneNumberWithError(numberStr, it)
    return number.isValid()
  }, countryCodes)

  return parsePhoneNumberWithError(numberStr, matchedCountry).number
}

const initialValues = {
  phoneNumber: ''
}

const getErrorMsg = (formikErrors, formikTouched) => {
  if (!formikErrors || !formikTouched) return null
  if (formikErrors.phoneNumber && formikTouched.phoneNumber)
    return formikErrors.phoneNumber
  return null
}

const CreateCustomerModal = ({ showModal, handleClose, onSubmit, locale }) => {
  const possibleCountries = R.append(
    locale?.country,
    R.map(it => it.country, locale?.overrides ?? [])
  )

  return (
    <Modal
      closeOnBackdropClick={true}
      width={600}
      height={300}
      handleClose={handleClose}
      open={showModal}>
      <Formik
        validationSchema={getValidationSchema(possibleCountries)}
        initialValues={initialValues}
        validateOnChange={false}
        onSubmit={values => {
          onSubmit({
            variables: {
              phoneNumber: formatPhoneNumber(
                possibleCountries,
                values.phoneNumber
              )
            }
          })
        }}>
        {({ errors, touched }) => (
          <Form
            id="customer-registration-form"
            className="flex flex-col h-full">
            <H1 className="-mt-2">Create new customer</H1>
            <Field
              component={TextInput}
              name="phoneNumber"
              width={338}
              autoFocus
              label="Phone number"
            />
            <div className="flex flex-row mt-auto mb-6">
              {getErrorMsg(errors, touched) && (
                <ErrorMessage>{getErrorMsg(errors, touched)}</ErrorMessage>
              )}
              <Button
                type="submit"
                form="customer-registration-form"
                className="ml-auto">
                Finish
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateCustomerModal
