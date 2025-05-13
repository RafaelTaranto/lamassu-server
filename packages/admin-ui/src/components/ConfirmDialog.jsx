import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import React, { memo, useState } from 'react'
import { H4, P } from './typography'
import CloseIcon from '../styling/icons/action/close/zodiac.svg?react'

import { Button } from './buttons'
import { TextInput } from './inputs'

import ErrorMessage from './ErrorMessage'
import SvgIcon from '@mui/material/SvgIcon'

export const DialogTitle = ({ children, onClose }) => {
  return (
    <div className="p-4 pr-3 flex justify-between">
      {children}
      {onClose && (
        <IconButton aria-label="close" onClick={onClose} className="p-0 -mt-1">
          <SvgIcon fontSize="small">
            <CloseIcon />
          </SvgIcon>
        </IconButton>
      )}
    </div>
  )
}

export const ConfirmDialog = memo(
  ({
    title = 'Confirm action',
    errorMessage = 'This action requires confirmation',
    open,
    toBeConfirmed,
    saveButtonAlwaysEnabled = false,
    message,
    confirmationMessage = `Write '${toBeConfirmed}' to confirm this action`,
    onConfirmed,
    onDismissed,
    initialValue = '',
    disabled = false,
    ...props
  }) => {
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState(false)
    const handleChange = event => setValue(event.target.value)

    const innerOnClose = () => {
      setValue('')
      setError(false)
      onDismissed()
    }

    const isOnErrorState =
      (!saveButtonAlwaysEnabled && toBeConfirmed !== value) || value === ''

    return (
      <Dialog open={open} aria-labelledby="form-dialog-title" {...props}>
        <DialogTitle id="customized-dialog-title" onClose={innerOnClose}>
          <H4 noMargin>{title}</H4>
        </DialogTitle>
        {errorMessage && (
          <DialogTitle>
            <ErrorMessage>
              {errorMessage.split(':').map(error => (
                <>
                  {error}
                  <br />
                </>
              ))}
            </ErrorMessage>
          </DialogTitle>
        )}
        <DialogContent className="w-108 p-4 pr-7">
          {message && <P>{message}</P>}
          <InputLabel htmlFor="confirm-input">{confirmationMessage}</InputLabel>
          <TextInput
            disabled={disabled}
            name="confirm-input"
            autoFocus
            id="confirm-input"
            type="text"
            size="sm"
            fullWidth
            value={value}
            touched={{}}
            error={error}
            InputLabelProps={{ shrink: true }}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions className="p-8 pt-4">
          <Button
            color="green"
            disabled={isOnErrorState}
            onClick={() => onConfirmed(value)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)
