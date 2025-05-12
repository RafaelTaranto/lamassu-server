import ClickAwayListener from '@mui/material/ClickAwayListener'
import classnames from 'classnames'
import React, { memo, useState } from 'react'
import Popper from 'src/components/Popper'
import ZoomIconInverse from 'src/styling/icons/circle buttons/search/white.svg?react'
import ZoomIcon from 'src/styling/icons/circle buttons/search/zodiac.svg?react'

import { FeatureButton } from 'src/components/buttons'

const ImagePopper = memo(
  ({ className, width, height, popupWidth, popupHeight, src }) => {
    const [popperAnchorEl, setPopperAnchorEl] = useState(null)

    const handleOpenPopper = event => {
      setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget)
    }

    const handleClosePopper = () => {
      setPopperAnchorEl(null)
    }

    const popperOpen = Boolean(popperAnchorEl)

    const Image = ({ className, style }) => (
      <img className={classnames(className)} style={style} src={src} alt="" />
    )

    return (
      <ClickAwayListener onClickAway={handleClosePopper}>
        <div className={classnames('flex flex-row', className)}>
          <Image
            className="object-cover rounded-tl-lg"
            style={{ width, height }}
          />
          <FeatureButton
            Icon={ZoomIcon}
            InverseIcon={ZoomIconInverse}
            className="rounded-none rounded-tr-lg rounded-br-lg"
            style={{ height }}
            onClick={handleOpenPopper}
          />
          <Popper open={popperOpen} anchorEl={popperAnchorEl} placement="top">
            <div className="py-2 px-4">
              <Image
                className="object-cover"
                style={{ width: popupWidth, height: popupHeight }}
              />
            </div>
          </Popper>
        </div>
      </ClickAwayListener>
    )
  }
)

export default ImagePopper
