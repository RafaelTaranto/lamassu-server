import classnames from 'classnames'
import * as R from 'ramda'
import React from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Title from 'src/components/Title'
import { Info1, Label1 } from 'src/components/typography'

import { SubpageButton } from 'src/components/buttons'

const TitleSection = ({
  className,
  title,
  error,
  labels,
  buttons = [],
  children,
  appendix,
  appendixRight
}) => {
  return (
    <div
      className={classnames(
        'flex justify-between items-center flex-row',
        className
      )}>
      <div className="flex items-center">
        <Title>{title}</Title>
        {!!appendix && appendix}
        {error && <ErrorMessage className="ml-3">Failed to save</ErrorMessage>}
        {buttons.length > 0 && (
          <>
            {buttons.map((button, idx) =>
              !R.isNil(button.component) ? (
                button.component
              ) : (
                <SubpageButton
                  key={idx}
                  className="ml-3"
                  Icon={button.icon}
                  InverseIcon={button.inverseIcon}
                  toggle={button.toggle}
                  forceDisable={button.forceDisable}>
                  <Info1 className="text-ghost font-mont text-base">
                    {button.text}
                  </Info1>
                </SubpageButton>
              )
            )}
          </>
        )}
      </div>
      <div className="flex flex-row items-center">
        {(labels ?? []).map(({ icon, label }, idx) => (
          <div key={idx} className="flex items-center">
            <div className="mr-1">{icon}</div>
            <Label1 className="mr-6">{label}</Label1>
          </div>
        ))}
        {appendixRight}
      </div>
      {children}
    </div>
  )
}

export default TitleSection
