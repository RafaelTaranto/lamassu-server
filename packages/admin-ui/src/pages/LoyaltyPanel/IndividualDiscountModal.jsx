import { Form, Formik, Field } from 'formik'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from '../../components/ErrorMessage'
import Modal from '../../components/Modal'
import { HelpTooltip } from '../../components/Tooltip'
import { H1, H3, P } from '../../components/typography'
import * as Yup from 'yup'

import { Button } from '../../components/buttons'
import { NumberInput, Autocomplete } from '../../components/inputs/formik'

const initialValues = {
  customer: '',
  discount: '',
}

const validationSchema = Yup.object().shape({
  customer: Yup.string().required('A customer is required!'),
  discount: Yup.number()
    .required('A discount rate is required!')
    .min(0, 'Discount rate should be a positive number!')
    .max(100, 'Discount rate should have a maximum value of 100%!'),
})

const getErrorMsg = (formikErrors, formikTouched, mutationError) => {
  if (!formikErrors || !formikTouched) return null
  if (mutationError) return 'Internal server error'
  if (formikErrors.customer && formikTouched.customer)
    return formikErrors.customer
  if (formikErrors.discount && formikTouched.discount)
    return formikErrors.discount
  return null
}

const IndividualDiscountModal = ({
  showModal,
  setShowModal,
  onClose,
  creationError,
  addDiscount,
  customers,
}) => {
  const handleAddDiscount = (customer, discount) => {
    addDiscount({
      variables: {
        customerId: customer,
        discount: parseInt(discount),
      },
    })
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <Modal
          title="Add individual customer discount"
          closeOnBackdropClick={true}
          width={600}
          height={500}
          handleClose={onClose}
          open={true}>
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={({ customer, discount }) => {
              handleAddDiscount(customer, discount)
            }}>
            {({ errors, touched }) => (
              <Form
                id="individual-discount-form"
                className="flex flex-col h-full gap-5">
                <div className="mt-2 w-88">
                  <Field
                    name="customer"
                    label="Select a customer"
                    component={Autocomplete}
                    fullWidth
                    options={R.map(it => ({
                      code: it.id,
                      display: `${it?.idCardData?.firstName ?? ``}${
                        it?.idCardData?.firstName && it?.idCardData?.lastName
                          ? ` `
                          : ``
                      }${it?.idCardData?.lastName ?? ``} (${it.phone})`,
                    }))(customers)}
                    labelProp="display"
                    valueProp="code"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <H3>Define discount rate</H3>
                    <HelpTooltip width={304}>
                      <P>
                        This is a percentage discount off of your existing
                        commission rates for a customer entering this code at
                        the machine.
                      </P>
                      <P>
                        For instance, if you charge 8% commissions, and this
                        code is set for 50%, then you'll instead be charging 4%
                        on transactions using the code.
                      </P>
                    </HelpTooltip>
                  </div>
                  <div className="flex items-center">
                    <Field
                      name="discount"
                      size="lg"
                      autoComplete="off"
                      width={50}
                      decimalScale={0}
                      component={NumberInput}
                    />
                    <H1 className="ml-2 mt-4 font-bold inline">%</H1>
                  </div>
                </div>
                <div className="flex mt-auto mb-6">
                  {getErrorMsg(errors, touched, creationError) && (
                    <ErrorMessage>
                      {getErrorMsg(errors, touched, creationError)}
                    </ErrorMessage>
                  )}
                  <Button
                    type="submit"
                    form="individual-discount-form"
                    className="ml-auto">
                    Add discount
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </>
  )
}

export default IndividualDiscountModal
