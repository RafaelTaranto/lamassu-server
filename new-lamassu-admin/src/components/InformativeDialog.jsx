import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { memo } from 'react'
import { H1 } from 'src/components/typography'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'

import { IconButton } from 'src/components/buttons'

export const InformativeDialog = memo(
  ({ title = '', open, onDissmised, disabled = false, data, ...props }) => {
    const innerOnClose = () => {
      onDissmised()
    }

    return (
      <Dialog
        PaperProps={{
          style: {
            borderRadius: 8
          }
        }}
        fullWidth
        open={open}
        aria-labelledby="form-dialog-title"
        {...props}>
        <div className="flex justify-end pt-4 pr-3 pb-0 pl-4">
          <IconButton size={16} aria-label="close" onClick={innerOnClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <H1 className="mt-0 mr-4 mb-2 ml-5">{title}</H1>
        <DialogContent>{data}</DialogContent>
      </Dialog>
    )
  }
)
