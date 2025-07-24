import React from 'react'
import { Form, Formik, Field } from 'formik'
import * as Yup from 'yup'

import Modal from '../../components/Modal'
import { Button } from '../../components/buttons'
import { TextInput } from '../../components/inputs/formik'
import ErrorMessage from '../../components/ErrorMessage'

const initialValues = {
  name: '',
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Set name is required')
    .max(50, 'Set name must be less than 50 characters'),
})

const CreateComplianceTriggerSet = ({
  showModal,
  onClose,
  onSubmit,
  createError,
}) => {
  return (
    <>
      {showModal && (
        <Modal
          title="Create Compliance Trigger Set"
          closeOnBackdropClick={true}
          width={600}
          height={400}
          handleClose={onClose}
          open={true}>
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col h-full gap-5">
                <div className="mt-2">
                  <Field
                    name="name"
                    label="Set Name"
                    component={TextInput}
                    fullWidth
                    autoFocus
                  />
                </div>

                <div className="flex mt-auto mb-6">
                  {errors.name && touched.name && (
                    <ErrorMessage>{errors.name}</ErrorMessage>
                  )}
                  {!errors.name && createError && (
                    <ErrorMessage>
                      {createError.graphQLErrors?.[0]?.extensions?.code ===
                      'RESOURCE_ALREADY_EXISTS'
                        ? 'A compliance trigger set with this name already exists'
                        : 'Failed to create compliance trigger set'}
                    </ErrorMessage>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto">
                    Create
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

export default CreateComplianceTriggerSet
