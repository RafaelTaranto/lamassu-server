import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import SvgIcon from '@mui/material/SvgIcon'
import IconButton from '@mui/material/IconButton'
import React, { memo } from 'react'
import { H1 } from './typography'
import CloseIcon from '../styling/icons/action/close/zodiac.svg?react'

export const InformativeDialog = memo(
  ({ title = '', open, onDissmised, data, ...props }) => {
    const innerOnClose = () => {
      onDissmised()
    }

    return (
      <Dialog
        PaperProps={{
          style: {
            borderRadius: 8,
          },
        }}
        fullWidth
        open={open}
        aria-labelledby="form-dialog-title"
        {...props}>
        <div className="flex justify-end pt-4 pr-3 pb-0 pl-4">
          <IconButton aria-label="close" onClick={innerOnClose}>
            <SvgIcon fontSize="small">
              <CloseIcon />
            </SvgIcon>
            <CloseIcon />
          </IconButton>
        </div>
        <H1 className="mt-0 mr-4 mb-2 ml-5">{title}</H1>
        <DialogContent>{data}</DialogContent>
      </Dialog>
    )
  },
)
