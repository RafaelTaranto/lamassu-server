import { Formik, Form, Field } from 'formik'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Modal from 'src/components/Modal'
import { H3 } from 'src/components/typography'
import * as Yup from 'yup'

import { Link } from 'src/components/buttons'
import { TextInput } from 'src/components/inputs/formik'

const BlackListModal = ({ onClose, addToBlacklist, errorMsg }) => {
  const handleAddToBlacklist = address => {
    addToBlacklist(address)
  }

  const placeholderAddress = '1ADwinnimZKGgQ3dpyfoUZvJh4p1UWSSpD'

  return (
    <Modal
      closeOnBackdropClick={true}
      width={676}
      height={200}
      handleClose={onClose}
      open={true}>
      <Formik
        validateOnBlur={false}
        validateOnChange={false}
        initialValues={{
          address: ''
        }}
        validationSchema={Yup.object({
          address: Yup.string().trim().required('An address is required')
        })}
        onSubmit={({ address }) => {
          handleAddToBlacklist(address.trim())
        }}>
        <Form id="address-form" className="flex flex-col">
          <H3 className="mt-auto mb-2">Blacklist new address</H3>
          <Field
            name="address"
            fullWidth
            autoComplete="off"
            label="Paste new address to blacklist here"
            placeholder={`ex: ${placeholderAddress}`}
            component={TextInput}
          />
          <div className="flex flex-row mt-auto">
            {!R.isNil(errorMsg) && <ErrorMessage>{errorMsg}</ErrorMessage>}
            <div className="flex ml-auto mt-12">
              <Link type="submit" form="address-form">
                Blacklist address
              </Link>
            </div>
          </div>
        </Form>
      </Formik>
    </Modal>
  )
}

export default BlackListModal
