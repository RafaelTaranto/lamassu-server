import React from 'react'
import ErrorMessage from 'src/components/ErrorMessage'
import Subtitle from 'src/components/Subtitle'

const Section = ({ error, children, title }) => {
  return (
    <div className="mb-8">
      {(title || error) && (
        <div className="flex items-center">
          <Subtitle className="mt-4 mr-5 mb-6 ml-0">{title}</Subtitle>
          {error && <ErrorMessage>Failed to save changes</ErrorMessage>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Section
