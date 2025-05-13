import React from 'react'
import InverseLinkIcon from '../../styling/icons/action/external link/white.svg?react'
import LinkIcon from '../../styling/icons/action/external link/zodiac.svg?react'

import { ActionButton } from './'

const SupportLinkButton = ({ link, label }) => {
  return (
    <a
      className="no-underline text-zodiac"
      target="_blank"
      rel="noopener noreferrer"
      href={link}>
      <ActionButton
        className="mb-8"
        color="primary"
        Icon={LinkIcon}
        InverseIcon={InverseLinkIcon}>
        {label}
      </ActionButton>
    </a>
  )
}

export default SupportLinkButton
