import React from 'react'
import { H1, P, Info2 } from '../../../components/typography'
import WarningIcon from '../../../styling/icons/warning-icon/comet.svg?react'

import { Button } from '../../../components/buttons'
import filledCassettes from '../../../styling/icons/cassettes/both-filled.svg'

const WizardSplash = ({ name, onContinue }) => {
  return (
    <div className="flex flex-col items-center flex-1 pt-0 pb-12 px-8 gap-4">
      <img width="148" height="196" alt="cassette" src={filledCassettes}></img>
      <div className="flex flex-col items-center">
        <H1 noMargin>Update counts</H1>
        <Info2 noMargin className="text-comet my-1">
          {name}
        </Info2>
      </div>
      <div className="flex items-center gap-2">
        <WarningIcon className="h-6 w-6" />
        <P noMargin className="flex-1">
          Before updating counts on Lamassu Admin, make sure you've done it
          before on the machines.
        </P>
      </div>
      <div className="flex items-center gap-2">
        <WarningIcon className="h-6 w-6" />
        <P noMargin className="flex-1">
          For cash cassettes, please make sure you've removed the remaining
          bills before adding the new ones.
        </P>
      </div>
      <Button className="ml-auto mt-auto mb-0" onClick={onContinue}>
        Get started
      </Button>
    </div>
  )
}

export default WizardSplash
