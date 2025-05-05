import CardContent from '@mui/material/CardContent'
import Card from '@mui/material/Card'
import classnames from 'classnames'
import { Form, Formik, Field as FormikField } from 'formik'
import * as R from 'ramda'
import { useState, React, useRef } from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import PromptWhenDirty from 'src/components/PromptWhenDirty'
import { MainStatus } from 'src/components/Status'
import { Label1, P, H3 } from 'src/components/typography'
import EditIcon from 'src/styling/icons/action/edit/enabled.svg?react'
import EditReversedIcon from 'src/styling/icons/action/edit/white.svg?react'
import AuthorizeIcon from 'src/styling/icons/button/authorize/white.svg?react'
import BlockIcon from 'src/styling/icons/button/block/white.svg?react'
import CancelReversedIcon from 'src/styling/icons/button/cancel/white.svg?react'
import DataReversedIcon from 'src/styling/icons/button/data/white.svg?react'
import DataIcon from 'src/styling/icons/button/data/zodiac.svg?react'
import ReplaceReversedIcon from 'src/styling/icons/button/replace/white.svg?react'
import SaveReversedIcon from 'src/styling/icons/circle buttons/save/white.svg?react'

import { ActionButton } from 'src/components/buttons'
import {
  OVERRIDE_REJECTED,
  OVERRIDE_PENDING
} from 'src/pages/Customers/components/consts'

const ReadOnlyField = ({ field, value }) => {
  return (
    <div className="h-12">
      <Label1 noMargin className="text-comet">
        {field.label}
      </Label1>
      <P noMargin className="overflow-hidden whitespace-nowrap text-ellipsis">
        {value}
      </P>
    </div>
  )
}

const EditableField = ({ editing, field, value, size, ...props }) => {
  if (!editing) return <ReadOnlyField field={field} value={value} />
  return (
    <div className="h-12">
      {editing && (
        <>
          <Label1 noMargin className="text-comet">
            {field.label}
          </Label1>
          <FormikField
            inputClasses="p-0 text-sm -mt-1"
            id={field.name}
            name={field.name}
            component={field.component}
            type={field.type}
            width={size}
            {...props}
          />
        </>
      )}
    </div>
  )
}

const EditableCard = ({
  fields,
  save = () => {},
  cancel = () => {},
  authorize = () => {},
  hasImage,
  reject = () => {},
  state,
  title,
  titleIcon,
  children = () => {},
  validationSchema,
  initialValues,
  deleteEditedData,
  retrieveAdditionalData,
  hasAdditionalData = true,
  editable,
  checkAgainstSanctions
}) => {
  const formRef = useRef()

  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(null)
  const [error, setError] = useState(null)

  const triggerInput = () => input.click()

  const authorized =
    state === OVERRIDE_PENDING
      ? { label: 'Pending', type: 'neutral' }
      : state === OVERRIDE_REJECTED
        ? { label: 'Rejected', type: 'error' }
        : { label: 'Accepted', type: 'success' }

  return (
    <Card className="rounded-xl">
      <CardContent>
        <div className="flex justify-between h-10">
          <div className="flex mb-4 gap-4">
            {titleIcon}
            <H3 noMargin>{title}</H3>
          </div>
          {state && authorize && <MainStatus statuses={[authorized]} />}
        </div>
        {children(formRef.current?.values ?? {})}
        <Formik
          innerRef={formRef}
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={values => {
            save(values)
            setEditing(false)
          }}
          onReset={() => {
            setEditing(false)
            setError(false)
          }}>
          {({ setFieldValue }) => (
            <Form>
              <PromptWhenDirty />
              <div className="flex">
                <div className="flex flex-col w-1/2">
                  {!hasImage &&
                    fields?.map((field, idx) => {
                      return idx >= 0 && idx < 4 ? (
                        !field.editable ? (
                          <ReadOnlyField
                            field={field}
                            value={initialValues[field.name]}
                          />
                        ) : (
                          <EditableField
                            field={field}
                            value={initialValues[field.name]}
                            editing={editing}
                            size={180}
                          />
                        )
                      ) : null
                    })}
                </div>
                <div className="flex flex-col w-1/2">
                  {!hasImage &&
                    fields?.map((field, idx) => {
                      return idx >= 4 ? (
                        !field.editable ? (
                          <ReadOnlyField
                            field={field}
                            value={initialValues[field.name]}
                          />
                        ) : (
                          <EditableField
                            field={field}
                            value={initialValues[field.name]}
                            editing={editing}
                            size={180}
                          />
                        )
                      ) : null
                    })}
                </div>
              </div>
              <div className="flex justify-end mt-5 gap-2">
                {!editing && (
                  <>
                    {!hasAdditionalData && (
                      <ActionButton
                        color="primary"
                        type="button"
                        Icon={DataIcon}
                        InverseIcon={DataReversedIcon}
                        onClick={() => retrieveAdditionalData()}>
                        Retrieve API data
                      </ActionButton>
                    )}
                    {checkAgainstSanctions && (
                      <ActionButton
                        color="primary"
                        type="button"
                        Icon={DataIcon}
                        InverseIcon={DataReversedIcon}
                        onClick={() => checkAgainstSanctions()}>
                        Check against OFAC sanction list
                      </ActionButton>
                    )}
                    {editable && (
                      <ActionButton
                        color="primary"
                        Icon={EditIcon}
                        InverseIcon={EditReversedIcon}
                        onClick={() => setEditing(true)}>
                        Edit
                      </ActionButton>
                    )}
                    {!editable &&
                      authorize &&
                      authorized.label !== 'Accepted' && (
                        <ActionButton
                          color="spring"
                          type="button"
                          Icon={AuthorizeIcon}
                          InverseIcon={AuthorizeIcon}
                          onClick={() => authorize()}>
                          Authorize
                        </ActionButton>
                      )}
                    {!editable &&
                      authorize &&
                      authorized.label !== 'Rejected' && (
                        <ActionButton
                          color="tomato"
                          type="button"
                          Icon={BlockIcon}
                          InverseIcon={BlockIcon}
                          onClick={() => reject()}>
                          Reject
                        </ActionButton>
                      )}
                  </>
                )}
                {editing && (
                  <>
                    {hasImage && state !== OVERRIDE_PENDING && (
                      <ActionButton
                        color="secondary"
                        type="button"
                        Icon={ReplaceReversedIcon}
                        InverseIcon={ReplaceReversedIcon}
                        onClick={() => triggerInput()}>
                        {
                          <div>
                            <input
                              type="file"
                              alt=""
                              accept="image/*"
                              className="hidden"
                              ref={fileInput => setInput(fileInput)}
                              onChange={event => {
                                // need to store it locally if we want to display it even after saving to db
                                const file = R.head(event.target.files)
                                if (!file) return
                                setFieldValue(R.head(fields).name, file)
                              }}
                            />
                            Replace
                          </div>
                        }
                      </ActionButton>
                    )}
                    {fields && (
                      <ActionButton
                        color="secondary"
                        Icon={SaveReversedIcon}
                        InverseIcon={SaveReversedIcon}
                        type="submit">
                        Save
                      </ActionButton>
                    )}
                    <ActionButton
                      color="secondary"
                      Icon={CancelReversedIcon}
                      InverseIcon={CancelReversedIcon}
                      onClick={() => cancel()}
                      type="reset">
                      Cancel
                    </ActionButton>
                    {authorize && authorized.label !== 'Accepted' && (
                      <ActionButton
                        color="spring"
                        type="button"
                        Icon={AuthorizeIcon}
                        InverseIcon={AuthorizeIcon}
                        onClick={() => authorize()}>
                        Authorize
                      </ActionButton>
                    )}
                    {authorize && authorized.label !== 'Rejected' && (
                      <ActionButton
                        color="tomato"
                        type="button"
                        Icon={BlockIcon}
                        InverseIcon={BlockIcon}
                        onClick={() => reject()}>
                        Reject
                      </ActionButton>
                    )}
                    {error && (
                      <ErrorMessage>Failed to save changes</ErrorMessage>
                    )}
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}

export default EditableCard
