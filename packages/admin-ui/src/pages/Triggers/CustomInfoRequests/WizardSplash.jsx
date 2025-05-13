import React from 'react'
import { H1, P } from '../../../components/typography'
import CustomReqLogo from '../../../styling/icons/compliance/custom-requirement.svg?react'

import { Button } from '../../../components/buttons'

const WizardSplash = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center py-0 px-10 flex-1">
      <CustomReqLogo className="max-h-37 max-w-50" />
      <H1 className="mt-6 mb-8 mx-0">Custom information request</H1>
      <P className="m-0">
        A custom information request allows you to have an extra option to ask
        specific information about your customers when adding a trigger that
        isn't an option on the default requirements list.
      </P>
      <P>
        Note that adding a custom information request isn't the same as adding
        triggers. You will still need to add a trigger with the new requirement
        to get this information from your customers.
      </P>
      <Button className="mt-auto mb-14" onClick={onContinue}>
        Get started
      </Button>
    </div>
  )
}

export default WizardSplash
