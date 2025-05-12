import React from 'react'
import { H4, P } from 'src/components/typography/index.jsx'
import { HelpTooltip } from 'src/components/Tooltip.jsx'
import { SupportLinkButton } from 'src/components/buttons/index.js'

const Header = ({ title, tooltipText, articleUrl }) => (
  <div className="flex items-center">
    <H4>{title}</H4>
    <HelpTooltip width={320}>
      <P>{tooltipText}</P>
      <SupportLinkButton
        link={articleUrl}
        label="Lamassu Support Article"
        bottomSpace="1"
      />
    </HelpTooltip>
  </div>
)

export default Header
