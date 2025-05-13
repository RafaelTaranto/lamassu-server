import { Form, Formik, Field } from 'formik'
import { React } from 'react'
import ErrorMessage from '../../../../components/ErrorMessage'
import Modal from '../../../../components/Modal'
import * as Yup from 'yup'

import { Button } from '../../../../components/buttons'
import { TextInput } from '../../../../components/inputs/formik'

const initialValues = {
  title: '',
  content: '',
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required().trim().max(25),
  content: Yup.string().required(),
})

const NewNoteModal = ({ showModal, onClose, onSubmit, errorMsg }) => {
  return (
    <>
      <Modal
        title="New note"
        closeOnBackdropClick={true}
        width={416}
        height={472}
        handleClose={onClose}
        open={showModal}>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={({ title, content }) => {
            onSubmit({ title, content })
          }}>
          <Form id="note-form" className="flex flex-col h-full gap-5">
            <Field
              name="title"
              autofocus
              size="md"
              autoComplete="off"
              width={350}
              component={TextInput}
              label="Note title"
            />
            <Field
              name="content"
              size="sm"
              autoComplete="off"
              width={350}
              component={TextInput}
              multiline={true}
              rows={11}
              label="Note content"
            />
            <div className="flex flex-row mt-auto mb-6">
              {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
              <Button
                type="submit"
                form="note-form"
                className="mt-auto ml-auto">
                Add note
              </Button>
            </div>
          </Form>
        </Formik>
      </Modal>
    </>
  )
}

export default NewNoteModal
