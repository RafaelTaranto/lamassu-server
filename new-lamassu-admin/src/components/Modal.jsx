import MaterialModal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import classnames from 'classnames'
import React from 'react'
import { H1, H4 } from 'src/components/typography'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'

import { IconButton } from 'src/components/buttons'

const Modal = ({
  width,
  height,
  infoPanelHeight,
  title,
  small,
  xl,
  infoPanel,
  handleClose,
  children,
  secondaryModal,
  className,
  closeOnEscape,
  closeOnBackdropClick,
  ...props
}) => {
  const TitleCase = small ? H4 : H1
  const closeSize = xl ? 28 : small ? 16 : 20

  const innerClose = (evt, reason) => {
    if (!closeOnBackdropClick && reason === 'backdropClick') return
    if (!closeOnEscape && reason === 'escapeKeyDown') return
    handleClose()
  }

  const marginBySize = xl ? 0 : small ? 12 : 16
  const paddingBySize = xl ? 88 : small ? 16 : 32
  return (
    <MaterialModal
      onClose={innerClose}
      className="flex justify-center flex-col items-center"
      {...props}>
      <>
        <Paper
          style={{ width, height, minHeight: height ?? 400 }}
          className={classnames(
            'flex flex-col max-h-[90vh] rounded-lg outline-0',
            className
          )}>
          <div className="flex">
            {title && (
              <TitleCase
                className={
                  small ? 'mt-5 mr-0 mb-2 ml-4' : 'mt-7 mr-0 mb-2 ml-8'
                }>
                {title}
              </TitleCase>
            )}
            <div
              className="ml-auto"
              style={{ marginRight: marginBySize, marginTop: marginBySize }}>
              <IconButton
                size={closeSize}
                className="p-0 mb-auto ml-auto"
                onClick={() => handleClose()}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <div
            className="w-full flex flex-col flex-1"
            style={{ paddingRight: paddingBySize, paddingLeft: paddingBySize }}>
            {children}
          </div>
        </Paper>
        {infoPanel && (
          <Paper
            style={{
              width,
              height: infoPanelHeight,
              minHeight: infoPanelHeight ?? 200
            }}
            className={classnames(
              'mt-4 flex flex-col max-h-[90vh] overflow-y-auto rounded-lg outline-0',
              className
            )}>
            <div className="w-full flex flex-col flex-1 py-0 px-6">
              {infoPanel}
            </div>
          </Paper>
        )}
      </>
    </MaterialModal>
  )
}

export default Modal
