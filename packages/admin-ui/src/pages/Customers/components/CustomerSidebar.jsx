import classnames from 'classnames'
import React from 'react'
import CustomerDataReversedIcon from '../../../styling/icons/customer-nav/data/comet.svg?react'
import CustomerDataIcon from '../../../styling/icons/customer-nav/data/white.svg?react'
import NoteReversedIcon from '../../../styling/icons/customer-nav/note/comet.svg?react'
import NoteIcon from '../../../styling/icons/customer-nav/note/white.svg?react'
import OverviewReversedIcon from '../../../styling/icons/customer-nav/overview/comet.svg?react'
import OverviewIcon from '../../../styling/icons/customer-nav/overview/white.svg?react'
import PhotosReversedIcon from '../../../styling/icons/customer-nav/photos/comet.svg?react'
import Photos from '../../../styling/icons/customer-nav/photos/white.svg?react'

import { P } from '/src/components/typography/index.jsx'

const CustomerSidebar = ({ isSelected, onClick }) => {
  const sideBarOptions = [
    {
      code: 'overview',
      display: 'Overview',
      Icon: OverviewIcon,
      InverseIcon: OverviewReversedIcon,
    },
    {
      code: 'customerData',
      display: 'Customer data',
      Icon: CustomerDataIcon,
      InverseIcon: CustomerDataReversedIcon,
    },
    {
      code: 'notes',
      display: 'Notes',
      Icon: NoteIcon,
      InverseIcon: NoteReversedIcon,
    },
    {
      code: 'photos',
      display: 'Photos & files',
      Icon: Photos,
      InverseIcon: PhotosReversedIcon,
    },
  ]

  return (
    <div className="flex flex-col rounded-sm w-55 bg-zircon overflow-hidden">
      {sideBarOptions?.map(({ Icon, InverseIcon, display, code }, idx) => (
        <div
          key={idx}
          className={classnames({
            'gap-4 p-4 cursor-pointer flex items-center': true,
            'bg-comet2': isSelected(code),
          })}
          onClick={() => onClick(code)}>
          {isSelected(code) ? <Icon /> : <InverseIcon />}
          <P
            noMargin
            className={classnames({
              'text-comet2': true,
              'text-white font-bold': isSelected(code),
            })}>
            {display}
          </P>
        </div>
      ))}
    </div>
  )
}

export default CustomerSidebar
