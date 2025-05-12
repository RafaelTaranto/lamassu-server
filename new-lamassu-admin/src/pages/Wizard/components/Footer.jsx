import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import React, { useState } from 'react'
import Modal from 'src/components/Modal'
import Stepper from 'src/components/Stepper'
import { P, H2, Info2 } from 'src/components/typography'

import { Button, Link } from 'src/components/buttons'

function Footer({ currentStep, steps, subtitle, text, exImage, open, start }) {
  const [fullExample, setFullExample] = useState(false)

  return (
    <Drawer
      anchor={'bottom'}
      open={true}
      variant={'persistent'}
      classes={{ paperAnchorDockedBottom: 'border-t-0 shadow-sm' }}>
      <div className={`py-8 flex-grow ${open ? 'h-[264px]' : 'h-[84px]'}`}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="baseline">
          <Grid
            item
            xs={5}
            container
            direction={open ? 'column' : 'row'}
            justifyContent="flex-start"
            alignItems="baseline">
            <H2 className="m-0 mr-8">Setup Lamassu Admin</H2>
            <Info2 className="mt-2 mb-2 leading-tight inline">{subtitle}</Info2>
            {open && <P>{text}</P>}
          </Grid>
          <Grid
            item
            xs={4}
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-end"
            spacing={5}>
            <Grid item xs={12}>
              {steps && currentStep && (
                <Stepper currentStep={currentStep} steps={steps} />
              )}
            </Grid>
          </Grid>
        </Grid>
        {open && (
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="baseline">
            <Grid
              item
              xs={5}
              container
              direction="column"
              justifyContent="flex-start"
              alignItems="flex-start">
              <Link
                onClick={() => {
                  setFullExample(true)
                }}>
                See full example
              </Link>
            </Grid>
            <Grid
              item
              xs={4}
              container
              direction="column"
              justifyContent="flex-start"
              alignItems="flex-end"
              spacing={5}>
              <Grid item>
                <Button size="lg" onClick={start}>
                  Get Started
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </div>
      <Modal
        closeOnEscape={true}
        closeOnBackdropClick={true}
        className="bg-transparent shadow-none"
        xl={true}
        width={1152 + 120 + 56}
        handleClose={() => {
          setFullExample(false)
        }}
        open={fullExample}>
        <img width={1152} src={exImage} alt="" />
      </Modal>
    </Drawer>
  )
}

export default Footer
