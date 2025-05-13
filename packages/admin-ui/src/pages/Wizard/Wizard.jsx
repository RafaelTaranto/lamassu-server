import { useQuery, gql } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import classnames from 'classnames'
import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { getWizardStep, STEPS } from './helper'

import AppContext from '../../AppContext'

import Footer from './components/Footer'

const GET_DATA = gql`
  query getData {
    config
    accounts
    cryptoCurrencies {
      code
      display
    }
  }
`

const Wizard = () => {
  const { data, loading } = useQuery(GET_DATA)
  const history = useHistory()
  const { setWizardTested } = useContext(AppContext)

  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(true)

  const [footerExp, setFooterExp] = useState(false)

  if (loading) {
    return <></>
  }

  const wizardStep = getWizardStep(data?.config, data?.cryptoCurrencies)

  const shouldGoBack =
    history.length && !history.location.state?.fromAuthRegister

  if (wizardStep === 0) {
    setWizardTested(true)
    shouldGoBack ? history.goBack() : history.push('/')
  }

  const isWelcome = step === 0

  const start = () => {
    setFooterExp(false)
  }

  const doContinue = () => {
    if (step >= STEPS.length - 1) {
      setOpen(false)
      history.push('/')
    }

    const nextStep = step === 0 && wizardStep ? wizardStep : step + 1

    setFooterExp(true)
    setStep(nextStep)
  }

  const current = STEPS[step]
  const classNames = {
    'flex flex-col justify-between py-4 px-0 bg-white': true,
    'bg-[url(/wizard-background.svg)] bg-no-repeat bg-center bg-fixed bg-cover':
      isWelcome,
    'blur-sm pointer-events-none': footerExp,
  }

  return (
    <Dialog fullScreen open={open}>
      <DialogContent className={classnames(classNames)}>
        <current.Component doContinue={doContinue} isActive={!footerExp} />
      </DialogContent>
      {!isWelcome && (
        <Footer
          currentStep={step}
          steps={STEPS.length - 1}
          exImage={current.exImage}
          subtitle={current.subtitle}
          text={current.text}
          open={footerExp}
          start={start}
        />
      )}
    </Dialog>
  )
}

export default Wizard
