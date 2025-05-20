import Paper from '@mui/material/Paper'
import { formatDurationWithOptions, intervalToDuration } from 'date-fns/fp'
import { Form, Formik, Field } from 'formik'
import { React, useRef } from 'react'
import { P } from '../../../../components/typography'
import CancelIconInverse from '../../../../styling/icons/button/cancel/white.svg?react'
import CancelIcon from '../../../../styling/icons/button/cancel/zodiac.svg?react'
import SaveIconInverse from '../../../../styling/icons/circle buttons/save/white.svg?react'
import SaveIcon from '../../../../styling/icons/circle buttons/save/zodiac.svg?react'
import * as Yup from 'yup'

import { ActionButton } from '../../../../components/buttons'
import { TextInput } from '../../../../components/inputs/formik'
import { toTimezone } from '../../../../utils/timezones'

const NoteEdit = ({ note, cancel, edit, timezone }) => {
  const formRef = useRef()

  const validationSchema = Yup.object().shape({
    content: Yup.string(),
  })

  const initialValues = {
    content: note.content,
  }

  return (
    <Paper className="p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <P noMargin>
          {`Last edited `}
          {formatDurationWithOptions(
            { delimited: ', ' },
            intervalToDuration({
              start: toTimezone(new Date(note.lastEditedAt), timezone),
              end: toTimezone(new Date(), timezone),
            }),
          )}
          {` ago`}
        </P>
        <div className="flex flex-row items-center gap-2">
          <ActionButton
            color="primary"
            type="button"
            Icon={CancelIcon}
            InverseIcon={CancelIconInverse}
            onClick={cancel}>
            {`Cancel`}
          </ActionButton>
          <ActionButton
            color="primary"
            type="submit"
            form="edit-note"
            Icon={SaveIcon}
            InverseIcon={SaveIconInverse}>
            {`Save changes`}
          </ActionButton>
          <ActionButton
            color="primary"
            type="button"
            Icon={CancelIcon}
            InverseIcon={CancelIconInverse}
            onClick={() => formRef.current.setFieldValue('content', '')}>
            {`Clear content`}
          </ActionButton>
        </div>
      </div>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={({ content }) =>
          edit({
            noteId: note.id,
            newContent: content,
            oldContent: note.content,
          })
        }
        innerRef={formRef}>
        <Form id="edit-note">
          <Field
            name="content"
            component={TextInput}
            InputProps={{ disableUnderline: true }}
            size="sm"
            autoComplete="off"
            fullWidth
            multiline={true}
            rows={15}
          />
        </Form>
      </Formik>
    </Paper>
  )
}

export default NoteEdit
