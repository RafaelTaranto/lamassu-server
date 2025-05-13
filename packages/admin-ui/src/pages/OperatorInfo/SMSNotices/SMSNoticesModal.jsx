import Chip from '@mui/material/Chip'
import { Form, Formik, Field } from 'formik'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from '../../../components/ErrorMessage'
import Modal from '../../../components/Modal'
import { Info2 } from '../../../components/typography'
import DefaultIconReverse from '../../../styling/icons/button/retry/white.svg?react'
import DefaultIcon from '../../../styling/icons/button/retry/zodiac.svg?react'
import * as Yup from 'yup'

import { ActionButton, Button } from '../../../components/buttons'
import { TextInput } from '../../../components/inputs/formik'
import { zircon } from '../../../styling/variables'

const getErrorMsg = (formikErrors, formikTouched, mutationError) => {
  if (!formikErrors || !formikTouched) return null
  if (mutationError) return 'Internal server error'
  if (formikErrors.event && formikTouched.event) return formikErrors.event
  if (formikErrors.message && formikTouched.message) return formikErrors.message
  return null
}

const PREFILL = {
  smsCode: {
    validator: Yup.string()
      .required('The message content is required!')
      .trim()
      .test({
        name: 'has-code',
        message: 'The confirmation code is missing from the message!',
        exclusive: false,
        test: value => value?.match(/#code/g)?.length > 0,
      })
      .test({
        name: 'has-single-code',
        message: 'There should be a single confirmation code!',
        exclusive: false,
        test: value => value?.match(/#code/g)?.length === 1,
      }),
  },
  cashOutDispenseReady: {
    validator: Yup.string().required('The message content is required!').trim(),
  },
  smsReceipt: {
    validator: Yup.string().trim(),
  },
}

const CHIPS = {
  smsCode: [
    { code: '#code', display: 'Confirmation code', obligatory: true },
    { code: '#timestamp', display: 'Timestamp', obligatory: false },
  ],
  cashOutDispenseReady: [
    { code: '#timestamp', display: 'Timestamp', obligatory: false },
  ],
  smsReceipt: [{ code: '#timestamp', display: 'Timestamp', obligatory: false }],
}

const DEFAULT_MESSAGES = {
  smsCode: 'Your cryptomat code: #code',
  cashOutDispenseReady:
    'Your cash is waiting! Go to the Cryptomat and press Redeem within 24 hours. [#timestamp]',
  smsReceipt: '',
}

const SMSNoticesModal = ({
  showModal,
  onClose,
  sms,
  creationError,
  submit,
}) => {
  const initialValues = {
    event: !R.isNil(sms) ? sms.event : '',
    message: !R.isNil(sms) ? sms.message : '',
  }

  const validationSchema = Yup.object().shape({
    event: Yup.string().required('An event is required!'),
    message:
      PREFILL[sms?.event]?.validator ??
      Yup.string().required('The message content is required!').trim(),
  })

  const handleSubmit = values => {
    sms
      ? submit({
          variables: {
            id: sms.id,
            event: values.event,
            message: values.message,
          },
        })
      : submit({
          variables: {
            event: values.event,
            message: values.message,
          },
        })
    onClose()
  }

  return (
    <>
      {showModal && (
        <Modal
          title={`SMS notice - ${sms?.messageName}`}
          closeOnBackdropClick={true}
          width={600}
          height={500}
          open={true}
          handleClose={onClose}>
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, errors, touched) =>
              handleSubmit(values, errors, touched)
            }>
            {({ values, errors, touched, setFieldValue }) => (
              <Form id="sms-notice" className="flex flex-col h-full gap-5">
                <ActionButton
                  color="primary"
                  Icon={DefaultIcon}
                  InverseIcon={DefaultIconReverse}
                  className="w-37"
                  type="button"
                  onClick={() =>
                    setFieldValue('message', DEFAULT_MESSAGES[sms?.event])
                  }>
                  Reset to default
                </ActionButton>
                <Field
                  name="message"
                  label="Message content"
                  fullWidth
                  multiline={true}
                  rows={6}
                  component={TextInput}
                />
                {R.length(CHIPS[sms?.event]) > 0 && (
                  <Info2 noMargin>Values to attach</Info2>
                )}
                <div className="w-120">
                  {R.splitEvery(3, CHIPS[sms?.event]).map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      {it.map((ite, idx2) => (
                        <Chip
                          key={idx2}
                          label={ite.display}
                          size="small"
                          style={{ backgroundColor: zircon }}
                          disabled={R.includes(ite.code, values.message)}
                          className="p-2"
                          onClick={() => {
                            setFieldValue(
                              'message',
                              values.message.concat(
                                R.last(values.message) === ' ' ? '' : ' ',
                                ite.code,
                              ),
                            )
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex flex-row mt-auto mx-0 mb-6">
                  {getErrorMsg(errors, touched, creationError) && (
                    <ErrorMessage>
                      {getErrorMsg(errors, touched, creationError)}
                    </ErrorMessage>
                  )}
                  <Button
                    type="submit"
                    form="sms-notice"
                    className="mt-auto ml-auto mr-0 mb-0">
                    Confirm
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

export default SMSNoticesModal
