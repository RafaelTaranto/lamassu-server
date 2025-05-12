import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import classnames from 'classnames'
import { Field, useFormikContext } from 'formik'
import * as R from 'ramda'
import React, { useContext, useState } from 'react'
import { DeleteDialog } from 'src/components/DeleteDialog'
import { Td, Tr } from 'src/components/fake-table/Table'
import { Label2 } from 'src/components/typography'
import DisabledDeleteIcon from 'src/styling/icons/action/delete/disabled.svg?react'
import DeleteIcon from 'src/styling/icons/action/delete/enabled.svg?react'
import DisabledEditIcon from 'src/styling/icons/action/edit/disabled.svg?react'
import EditIcon from 'src/styling/icons/action/edit/enabled.svg?react'
import StripesSvg from 'src/styling/icons/stripes.svg?react'

import { Link } from 'src/components/buttons'

import TableCtx from './Context'
import moduleStyles from './Row.module.css'

const ActionCol = ({ disabled, editing }) => {
  const { values, submitForm, resetForm } = useFormikContext()
  const {
    editWidth,
    onEdit,
    enableEdit,
    enableDelete,
    disableRowEdit,
    onDelete,
    deleteWidth,
    enableToggle,
    onToggle,
    toggleWidth,
    forceAdd,
    clearError,
    actionColSize,
    error
  } = useContext(TableCtx)

  const disableEdit = disabled || (disableRowEdit && disableRowEdit(values))
  const cancel = () => {
    clearError()
    resetForm()
  }

  const [deleteDialog, setDeleteDialog] = useState(false)

  const onConfirmed = () => {
    onDelete(values.id).then(res => {
      if (!R.isNil(res)) setDeleteDialog(false)
    })
  }

  return (
    <>
      {editing && (
        <Td textAlign="center" width={actionColSize}>
          <Link
            className={moduleStyles.saveButton}
            type="submit"
            color="primary"
            onClick={submitForm}>
            Save
          </Link>
          {!forceAdd && (
            <Link color="secondary" onClick={cancel}>
              Cancel
            </Link>
          )}
        </Td>
      )}
      {!editing && enableEdit && (
        <Td textAlign="center" width={editWidth}>
          <IconButton
            disabled={disableEdit}
            onClick={() => onEdit && onEdit(values.id)}
            size="small">
            <SvgIcon>
              {disableEdit ? <DisabledEditIcon /> : <EditIcon />}
            </SvgIcon>
          </IconButton>
        </Td>
      )}
      {!editing && enableDelete && (
        <Td textAlign="center" width={deleteWidth}>
          <IconButton
            disabled={disabled}
            onClick={() => {
              setDeleteDialog(true)
            }}
            size="small">
            <SvgIcon>
              {disabled ? <DisabledDeleteIcon /> : <DeleteIcon />}
            </SvgIcon>
          </IconButton>
          <DeleteDialog
            open={deleteDialog}
            setDeleteDialog={setDeleteDialog}
            onConfirmed={onConfirmed}
            onDismissed={() => {
              setDeleteDialog(false)
              clearError()
            }}
            errorMessage={error}
          />
        </Td>
      )}
      {!editing && enableToggle && (
        <Td textAlign="center" width={toggleWidth}>
          <Switch
            checked={!!values.active}
            value={!!values.active}
            disabled={disabled}
            onChange={() => onToggle(values.id)}
          />
        </Td>
      )}
    </>
  )
}

const ECol = ({ editing, focus, config, extraPaddingRight, extraPadding }) => {
  const {
    name,
    names,
    bypassField,
    input,
    editable = true,
    size,
    bold,
    width,
    textAlign,
    editingAlign = textAlign,
    prefix,
    PrefixComponent = Label2,
    suffix,
    SuffixComponent = Label2,
    textStyle = it => {},
    isHidden = it => false,
    view = it => it?.toString(),
    inputProps = {}
  } = config

  const fields = names ?? [name]

  const { values } = useFormikContext()
  const isEditable = editable => {
    if (typeof editable === 'function') return editable(values)
    return editable
  }
  const isEditing = editing && isEditable(editable)
  const isField = !bypassField

  const innerProps = {
    fullWidth: true,
    autoFocus: focus,
    size,
    bold,
    textAlign: isEditing ? editingAlign : textAlign,
    ...inputProps
  }

  const newAlign = isEditing ? editingAlign : textAlign
  const justifyContent = newAlign === 'right' ? 'flex-end' : newAlign
  const style = suffix || prefix ? { justifyContent } : {}

  return (
    <div className={moduleStyles.fields}>
      {fields.map((f, idx) => (
        <Td
          style={style}
          key={idx}
          className={{
            [moduleStyles.extraPaddingRight]: extraPaddingRight,
            [moduleStyles.extraPadding]: extraPadding,
            'flex items-center': suffix || prefix
          }}
          width={width}
          size={size}
          bold={bold}
          textAlign={textAlign}>
          {prefix && !isHidden(values) && (
            <PrefixComponent
              className={moduleStyles.prefix}
              style={isEditing ? {} : textStyle(values, isEditing)}>
              {typeof prefix === 'function' ? prefix(f) : prefix}
            </PrefixComponent>
          )}
          {isEditing && isField && !isHidden(values) && (
            <Field name={f} component={input} {...innerProps} />
          )}
          {isEditing && !isField && !isHidden(values) && (
            <config.input name={f} />
          )}
          {!isEditing && values && !isHidden(values) && (
            <div style={textStyle(values, isEditing)}>
              {view(values[f], values)}
            </div>
          )}
          {suffix && !isHidden(values) && (
            <SuffixComponent
              className={moduleStyles.suffix}
              style={isEditing ? {} : textStyle(values, isEditing)}>
              {suffix}
            </SuffixComponent>
          )}
          {isHidden(values) && <StripesSvg />}
        </Td>
      ))}
    </div>
  )
}

const groupStriped = elements => {
  const [toStripe, noStripe] = R.partition(R.propEq('stripe', true))(elements)

  if (!toStripe.length) {
    return elements
  }

  const index = R.indexOf(toStripe[0], elements)
  const width = R.compose(R.sum, R.map(R.path(['width'])))(toStripe)

  return R.insert(
    index,
    { width, editable: false, view: () => <StripesSvg /> },
    noStripe
  )
}

const ERow = ({ editing, disabled, lastOfGroup, newRow }) => {
  const { touched, errors, values } = useFormikContext()
  const {
    elements,
    enableEdit,
    enableDelete,
    error,
    enableToggle,
    rowSize,
    stripeWhen
  } = useContext(TableCtx)

  const shouldStripe = !editing && stripeWhen && stripeWhen(values)

  const innerElements = shouldStripe ? groupStriped(elements) : elements
  const [toSHeader] = R.partition(R.has('doubleHeader'))(elements)

  const extraPaddingIndex = toSHeader?.length
    ? R.indexOf(toSHeader[0], elements)
    : -1

  const extraPaddingRightIndex = toSHeader?.length
    ? R.indexOf(toSHeader[toSHeader.length - 1], elements)
    : -1

  const elementToFocusIndex = innerElements.findIndex(
    it => it.editable === undefined || it.editable
  )

  const classNames = {
    [moduleStyles.lastOfGroup]: lastOfGroup
  }

  const touchedErrors = R.pick(R.keys(touched), errors)
  const hasTouchedErrors = touchedErrors && R.keys(touchedErrors).length > 0
  const hasErrors = hasTouchedErrors || !!error

  const errorMessage =
    error || (touchedErrors && R.values(touchedErrors).join(', '))

  return (
    <Tr
      className={classnames(classNames)}
      size={rowSize}
      error={editing && hasErrors}
      newRow={newRow && !hasErrors}
      shouldShowError
      errorMessage={errorMessage}>
      {innerElements.map((it, idx) => {
        return (
          <ECol
            key={idx}
            config={it}
            editing={editing}
            focus={idx === elementToFocusIndex && editing}
            extraPaddingRight={extraPaddingRightIndex === idx}
            extraPadding={extraPaddingIndex === idx}
          />
        )
      })}
      {(enableEdit || enableDelete || enableToggle) && (
        <ActionCol disabled={disabled} editing={editing} />
      )}
    </Tr>
  )
}

export default ERow
