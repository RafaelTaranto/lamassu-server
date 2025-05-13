import React from 'react'
import { H1, P, Info2 } from '../../components/typography'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'

import { Button } from '../../components/buttons'

const WizardSplash = ({ name, onContinue }) => {
  return (
    <div className="flex flex-col flex-1 px-8 gap-18">
      <div>
        <H1 className="text-neon text-center mb-3 mt-8">
          <TxOutIcon className="align-bottom mr-3 w-6 h-7" />
          <span>Enable cash-out</span>
        </H1>
        <Info2 noMargin className="mb-10 text-center">
          {name}
        </Info2>
        <P>
          You are about to activate cash-out functionality on your {name}{' '}
          machine which will allow your customers to sell crypto to you.
        </P>
        <P>
          In order to activate cash-out for this machine, please enter the
          denominations for the machine.
        </P>
      </div>
      <Button className="mx-auto" onClick={onContinue}>
        Start configuration
      </Button>
    </div>
  )
}

export default WizardSplash
