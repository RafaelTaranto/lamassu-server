import { Form, Formik, Field } from 'formik'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Modal from 'src/components/Modal'
import { HelpTooltip } from 'src/components/Tooltip'
import { H3, P, H1 } from 'src/components/typography'
import * as Yup from 'yup'

import { Button } from 'src/components/buttons'
import { TextInput, NumberInput } from 'src/components/inputs/formik'

const initialValues = {
  code: '',
  discount: ''
}

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required()
    .trim()
    .max(25)
    .matches(/^\S*$/, 'No whitespace allowed'),
  discount: Yup.number().required().min(0).max(100)
})

const PromoCodesModal = ({ showModal, onClose, errorMsg, addCode }) => {
  const handleAddCode = (code, discount) => {
    addCode(R.toUpper(code), parseInt(discount))
  }

  return (
    <>
      {showModal && (
        <Modal
          title="Add promo code discount"
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
            onSubmit={({ code, discount }) => {
              handleAddCode(code, discount)
            }}>
            {({ errors }) => (
              <Form id="promo-form" className="flex flex-col h-full">
                <H3 className="mt-5">Promo code name</H3>
                <Field
                  name="code"
                  autoFocus
                  size="lg"
                  autoComplete="off"
                  width={338}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  component={TextInput}
                />
                <div className="flex justify-start mt-10">
                  <H3>Define discount rate</H3>
                  <HelpTooltip width={304}>
                    <P>
                      This is a percentage discount off of your existing
                      commission rates for a customer entering this code at the
                      machine.
                    </P>
                    <P>
                      For instance, if you charge 8% commissions, and this code
                      is set for 50%, then you'll instead be charging 4% on
                      transactions using the code.
                    </P>
                  </HelpTooltip>
                </div>
                <div className="flex items-start">
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
                <div className="flex mt-auto mb-6">
                  {(errorMsg || !R.isEmpty(errors)) && (
                    <ErrorMessage>
                      {errorMsg || R.head(R.values(errors))}
                    </ErrorMessage>
                  )}
                  <Button type="submit" form="promo-form" className="ml-auto">
                    Add code
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

export default PromoCodesModal
