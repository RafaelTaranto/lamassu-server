import ClickAwayListener from '@mui/material/ClickAwayListener'
import * as R from 'ramda'
import React, { useState, memo } from 'react'
import Popper from './Popper'
import HelpIcon from '../styling/icons/action/help/zodiac.svg?react'

const usePopperHandler = () => {
  const [helpPopperAnchorEl, setHelpPopperAnchorEl] = useState(null)

  const handleOpenHelpPopper = event => {
    setHelpPopperAnchorEl(helpPopperAnchorEl ? null : event.currentTarget)
  }

  const openHelpPopper = event => {
    setHelpPopperAnchorEl(event.currentTarget)
  }

  const handleCloseHelpPopper = () => {
    setHelpPopperAnchorEl(null)
  }

  const helpPopperOpen = Boolean(helpPopperAnchorEl)

  return {
    helpPopperAnchorEl,
    helpPopperOpen,
    handleOpenHelpPopper,
    openHelpPopper,
    handleCloseHelpPopper,
  }
}

const HelpTooltip = memo(({ children, width }) => {
  const handler = usePopperHandler(width)

  return (
    <ClickAwayListener onClickAway={handler.handleCloseHelpPopper}>
      <div className="relative" onMouseLeave={handler.handleCloseHelpPopper}>
        {handler.helpPopperOpen && (
          <div className="absolute bg-transparent h-10 -left-1/2 w-[200%]"></div>
        )}
        <button
          type="button"
          className="border-0 bg-transparent outline-0 cursor-pointer mt-1"
          onMouseEnter={handler.openHelpPopper}>
          <HelpIcon />
        </button>
        <Popper
          open={handler.helpPopperOpen}
          anchorEl={handler.helpPopperAnchorEl}
          arrowEnabled={true}
          placement="bottom">
          <div className="py-2 px-4" style={{ width }}>
            {children}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  )
})

const HoverableTooltip = memo(({ parentElements, children, width }) => {
  const handler = usePopperHandler(width)

  return (
    <ClickAwayListener onClickAway={handler.handleCloseHelpPopper}>
      <div>
        {!R.isNil(parentElements) && (
          <div
            onMouseLeave={handler.handleCloseHelpPopper}
            onMouseEnter={handler.handleOpenHelpPopper}>
            {parentElements}
          </div>
        )}
        {R.isNil(parentElements) && (
          <button
            type="button"
            onMouseEnter={handler.handleOpenHelpPopper}
            onMouseLeave={handler.handleCloseHelpPopper}
            className="border-0 bg-transparent outline-0 cursor-pointer mt-1">
            <HelpIcon />
          </button>
        )}
        <Popper
          open={handler.helpPopperOpen}
          anchorEl={handler.helpPopperAnchorEl}
          placement="bottom">
          <div className="py-2 px-4" style={{ width }}>
            {children}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  )
})

export { HoverableTooltip, HelpTooltip }
