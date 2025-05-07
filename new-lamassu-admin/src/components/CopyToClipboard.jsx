import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState, useEffect } from 'react'
import { CopyToClipboard as ReactCopyToClipboard } from 'react-copy-to-clipboard'
import Popover from 'src/components/Popper.jsx'
import CopyIcon from 'src/styling/icons/action/copy/copy.svg?react'

import { comet } from 'src/styling/variables.js'

import { Label1, Mono } from './typography/index.jsx'

const CopyToClipboard = ({
  className,
  buttonClassname,
  children,
  wrapperClassname,
  removeSpace = true
}) => {
  const [anchorEl, setAnchorEl] = useState(null)

  useEffect(() => {
    if (anchorEl) setTimeout(() => setAnchorEl(null), 3000)
  }, [anchorEl])

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popper' : undefined

  return (
    <div className={classnames('flex items-center', wrapperClassname)}>
      {children && (
        <>
          <Mono noMargin className={className}>
            {children}
          </Mono>
          <div className={buttonClassname}>
            <ReactCopyToClipboard
              text={removeSpace ? R.replace(/\s/g, '')(children) : children}>
              <button
                className="border-0 bg-transparent cursor-pointer"
                aria-describedby={id}
                onClick={event => handleClick(event)}>
                <CopyIcon />
              </button>
            </ReactCopyToClipboard>
          </div>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            arrowSize={3}
            bgColor={comet}
            className="py-1 px-2"
            placement="top">
            <Label1 noMargin className="text-white rounded-sm">
              Copied to clipboard!
            </Label1>
          </Popover>
        </>
      )}
    </div>
  )
}

export default CopyToClipboard
