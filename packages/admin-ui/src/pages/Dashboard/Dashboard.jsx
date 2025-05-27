import { useQuery, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import TitleSection from '../../components/layout/TitleSection'
import { H1, Info2, TL2, Label1 } from '../../components/typography'
import TxInIcon from '../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'

import { Button } from '../../components/buttons'
import AddMachine from '../AddMachine'
import { errorColor } from '../../styling/variables'

import Footer from './Footer'
import RightSide from './RightSide'
import Paper from '@mui/material/Paper'
import SystemPerformance from './SystemPerformance/index.js'

const GET_DATA = gql`
  query getData {
    machines {
      name
    }
    serverVersion
  }
`

const Dashboard = () => {
  const [, navigate] = useLocation()
  const [open, setOpen] = useState(false)

  const { data, loading } = useQuery(GET_DATA)

  const onPaired = machine => {
    setOpen(false)
    navigate('/maintenance/machine-status', { state: { id: machine.deviceId } })
  }

  return !loading ? (
    !R.isEmpty(data.machines) ? (
      <>
        <TitleSection title="Dashboard">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <TxInIcon />
              <span>Cash-in</span>
            </div>
            <div className="flex items-center gap-2">
              <TxOutIcon />
              <span>Cash-out</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width={12} height={12}>
                <rect width={12} height={12} rx={3} fill={errorColor} />
              </svg>
              <span>Action Required</span>
            </div>
          </div>
        </TitleSection>
        <div className="flex mb-30 gap-4">
          <div className="flex flex-col flex-1">
            <Paper className="p-6 flex-1">
              <SystemPerformance />
            </Paper>
          </div>
          <div className="flex flex-col flex-1">
            <RightSide />
          </div>
        </div>
        <Footer />
      </>
    ) : (
      <>
        {open && (
          <AddMachine close={() => setOpen(false)} onPaired={onPaired} />
        )}
        <TitleSection title="Dashboard">
          <div className="flex flex-row">
            <span>
              <TL2 className="inline">{data?.serverVersion}</TL2>{' '}
              <Label1 className="inline"> server version</Label1>
            </span>
          </div>
        </TitleSection>
        <div className="h-75 bg-zircon border-zircon2 border-2">
          <div className="flex flex-col h-full justify-center items-center gap-6">
            <H1 className="text-comet2">No machines on your system yet</H1>
            <Info2 className="text-comet2">
              To fully take advantage of Lamassu Admin, add a new machine to
              your system
            </Info2>
            <Button onClick={() => setOpen(true)}>+ Add new machine</Button>
          </div>
        </div>
        <Footer />
      </>
    )
  ) : (
    <></>
  )
}

export default Dashboard
