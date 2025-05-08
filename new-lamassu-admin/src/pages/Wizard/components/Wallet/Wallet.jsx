import * as R from 'ramda'
import React, { useState } from 'react'
import Sidebar, { Stepper } from 'src/components/layout/Sidebar'
import TitleSection from 'src/components/layout/TitleSection'

import AllSet from './AllSet'
import Blockcypher from './Blockcypher'
import ChooseCoin from './ChooseCoin'
import ChooseExchange from './ChooseExchange'
import ChooseTicker from './ChooseTicker'
import ChooseWallet from './ChooseWallet'

const steps = [
  {
    label: 'Choose cryptocurrency',
    component: ChooseCoin
  },
  {
    label: 'Choose wallet',
    component: ChooseWallet
  },
  {
    label: 'Choose ticker',
    component: ChooseTicker
  },
  {
    label: 'Exchange',
    component: ChooseExchange
  },
  {
    label: 'Blockcypher',
    component: Blockcypher
  },
  {
    label: 'All set',
    component: AllSet
  }
]

const Wallet = ({ doContinue }) => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})

  const mySteps = data?.coin === 'BTC' ? steps : R.remove(4, 1, steps)

  const Component = mySteps[step].component

  const addData = it => {
    setData(R.merge(data, it))
    setStep(step + 1)
  }

  return (
    <div className="w-[1132px] h-full mx-auto flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <TitleSection title="Wallet settings"></TitleSection>
      </div>
      <div className="flex flex-1 flex-row">
        <Sidebar>
          {mySteps.map((it, idx) => (
            <Stepper key={idx} step={step} it={it} idx={idx} steps={mySteps} />
          ))}
        </Sidebar>
        <div className="ml-12">
          <Component data={data} addData={addData} doContinue={doContinue} />
        </div>
      </div>
    </div>
  )
}

export default Wallet
