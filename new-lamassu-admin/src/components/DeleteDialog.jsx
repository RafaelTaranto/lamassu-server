import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import React from 'react'
import { H4, P } from 'src/components/typography'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'

import { Button, IconButton } from 'src/components/buttons'

import ErrorMessage from './ErrorMessage'

export const DialogTitle = ({ children, close }) => {
  return (
    <div className="p-4 pr-3 flex justify-between m-0">
      {children}
      {close && (
        <IconButton
          size={16}
          aria-label="close"
          onClick={close}
          className="p-0 -mt-1">
          <CloseIcon />
        </IconButton>
      )}
    </div>
  )
}

export const DeleteDialog = ({
  title = 'Confirm Delete',
  open = false,
  onConfirmed,
  onDismissed,
  item = 'item',
  confirmationMessage = `Are you sure you want to delete this ${item}?`,
  extraMessage,
  errorMessage = ''
}) => {
  return (
    <Dialog open={open} aria-labelledby="form-dialog-title">
      <DialogTitle close={() => onDismissed()}>
        <H4 className="m-0">{title}</H4>
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
        {confirmationMessage && <P>{confirmationMessage}</P>}
        {extraMessage}
      </DialogContent>
      <DialogActions className="p-8 pt-4">
        <Button onClick={onConfirmed}>Confirm</Button>
      </DialogActions>
    </Dialog>
  )
}
