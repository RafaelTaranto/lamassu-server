import React from 'react'
import { H1, P } from '../../../components/typography'

import { Button } from '../../../components/buttons'

function Welcome({ doContinue }) {
  return (
    <div className="text-center flex flex-col items-center justify-center w-full h-full">
      <H1 className="text-5xl">Welcome to the Lamassu Admin</H1>
      <P className="text-2xl mb-14 text-comet">
        To get you started, we’ve put together a wizard that will
        <br />
        help set up what you need before pairing your machines.
      </P>
      <Button size="xl" onClick={doContinue}>
        Get started
      </Button>
    </div>
  )
}

export default Welcome
