import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { Form, Formik, Field } from 'formik'
import * as R from 'ramda'
import React, { useState } from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Modal from 'src/components/Modal'
import DataTable from 'src/components/tables/DataTable'
import DisabledDeleteIcon from 'src/styling/icons/action/delete/disabled.svg?react'
import DeleteIcon from 'src/styling/icons/action/delete/enabled.svg?react'
import EditIcon from 'src/styling/icons/action/edit/enabled.svg?react'
import DefaultIconReverse from 'src/styling/icons/button/retry/white.svg?react'
import DefaultIcon from 'src/styling/icons/button/retry/zodiac.svg?react'
import * as Yup from 'yup'

import { ActionButton, Button } from 'src/components/buttons'
import { TextInput } from 'src/components/inputs/formik'

const DEFAULT_MESSAGE = `This address may be associated with a deceptive offer or a prohibited group. Please make sure you're using an address from your own wallet.`

const getErrorMsg = (formikErrors, formikTouched, mutationError) => {
  if (mutationError) return 'Internal server error'
  if (!formikErrors || !formikTouched) return null
  if (formikErrors.event && formikTouched.event) return formikErrors.event
  if (formikErrors.message && formikTouched.message) return formikErrors.message
  return null
}

const BlacklistAdvanced = ({
  data,
  editBlacklistMessage,
  onClose,
  mutationError
}) => {
  const [selectedMessage, setSelectedMessage] = useState(null)

  const elements = [
    {
      name: 'label',
      header: 'Label',
      width: 250,
      textAlign: 'left',
      size: 'sm',
      view: it => R.path(['label'], it)
    },
    {
      name: 'content',
      header: 'Content',
      width: 690,
      textAlign: 'left',
      size: 'sm',
      view: it => R.path(['content'], it)
    },
    {
      name: 'edit',
      header: 'Edit',
      width: 130,
      textAlign: 'center',
      size: 'sm',
      view: it => (
        <IconButton className="pl-3" onClick={() => setSelectedMessage(it)}>
          <SvgIcon>
            <EditIcon />
          </SvgIcon>
        </IconButton>
      )
    },
    {
      name: 'deleteButton',
      header: 'Delete',
      width: 130,
      textAlign: 'center',
      size: 'sm',
      view: it => (
        <IconButton
          className="pl-3"
          disabled={
            !R.isNil(R.path(['allowToggle'], it)) &&
            !R.path(['allowToggle'], it)
          }>
          <SvgIcon>
            {R.path(['allowToggle'], it) ? (
              <DeleteIcon />
            ) : (
              <DisabledDeleteIcon />
            )}
          </SvgIcon>
        </IconButton>
      )
    }
  ]

  const handleModalClose = () => {
    setSelectedMessage(null)
  }

  const handleSubmit = values => {
    editBlacklistMessage(values)
    handleModalClose()
    !R.isNil(onClose) && onClose()
  }

  const initialValues = {
    label: !R.isNil(selectedMessage) ? selectedMessage.label : '',
    content: !R.isNil(selectedMessage) ? selectedMessage.content : ''
  }

  const validationSchema = Yup.object().shape({
    label: Yup.string().required('A label is required!'),
    content: Yup.string().required('The message content is required!').trim()
  })

  return (
    <>
      <DataTable
        data={R.path(['blacklistMessages'], data)}
        elements={elements}
        emptyText="No blacklisted addresses so far"
        name="blacklistTable"
      />
      {selectedMessage && (
        <Modal
          title={`Blacklist message - ${selectedMessage?.label}`}
          open={true}
          width={676}
          height={400}
          handleClose={handleModalClose}>
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={values =>
              handleSubmit({ id: selectedMessage.id, ...values })
            }>
            {({ errors, touched, setFieldValue }) => (
              <Form className="flex flex-col h-full gap-5 py-5">
                <ActionButton
                  color="primary"
                  Icon={DefaultIcon}
                  InverseIcon={DefaultIconReverse}
                  className="w-36"
                  type="button"
                  onClick={() => setFieldValue('content', DEFAULT_MESSAGE)}>
                  Reset to default
                </ActionButton>
                <Field
                  name="content"
                  label="Message content"
                  fullWidth
                  multiline={true}
                  rows={6}
                  component={TextInput}
                />
                <div className="flex flex-row ml-auto mt-auto">
                  {getErrorMsg(errors, touched, mutationError) && (
                    <ErrorMessage>
                      {getErrorMsg(errors, touched, mutationError)}
                    </ErrorMessage>
                  )}
                  <Button type="submit">Confirm</Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </>
  )
}

export default BlacklistAdvanced
