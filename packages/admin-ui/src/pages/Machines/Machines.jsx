import { useQuery, gql } from '@apollo/client'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import * as R from 'ramda'
import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { TL1, TL2, Label3 } from '../../components/typography'

import Cassettes from './MachineComponents/Cassettes'
import Commissions from './MachineComponents/Commissions'
import Details from './MachineComponents/Details'
import Overview from './MachineComponents/Overview'
import Transactions from './MachineComponents/Transactions'

const GET_INFO = gql`
  query getMachine($deviceId: ID!, $billFilters: JSONObject) {
    machine(deviceId: $deviceId) {
      name
      deviceId
      paired
      lastPing
      pairedAt
      version
      model
      cashUnits {
        cashbox
        cassette1
        cassette2
        cassette3
        cassette4
        recycler1
        recycler2
        recycler3
        recycler4
        recycler5
        recycler6
      }
      numberOfCassettes
      numberOfRecyclers
      statuses {
        label
        type
      }
      downloadSpeed
      responseTime
      packetLoss
      latestEvent {
        note
      }
    }
    bills(filters: $billFilters) {
      id
      fiat
      deviceId
      created
    }
    config
  }
`

const getMachineID = path => path.slice(path.lastIndexOf('/') + 1)

const MachineRoute = () => {
  const [location, navigate] = useLocation()
  const [loading, setLoading] = useState(true)

  const id = getMachineID(location)
  const { data, refetch } = useQuery(GET_INFO, {
    onCompleted: data => {
      if (data.machine === null) return navigate('/maintenance/machine-status')

      setLoading(false)
    },
    variables: {
      deviceId: id,
      billFilters: {
        deviceId: id,
        batch: 'none',
      },
    },
  })

  const reload = () => {
    return navigate(location)
  }

  return (
    !loading && (
      <Machines data={data} refetch={refetch} reload={reload}></Machines>
    )
  )
}

const Machines = ({ data, refetch, reload }) => {
  const timezone = R.path(['config', 'locale_timezone'], data) ?? {}

  const machine = R.path(['machine'])(data) ?? {}
  const config = R.path(['config'])(data) ?? {}
  const bills = R.groupBy(bill => bill.deviceId)(R.path(['bills'])(data) ?? [])

  const machineName = R.path(['name'])(machine) ?? null
  const machineID = R.path(['deviceId'])(machine) ?? null

  return (
    <div className="flex flex-1 h-full gap-12">
      <div className="basis-1/4 min-w-1/4 pt-8">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/dashboard" className="no-underline">
            <Label3 noMargin className="text-comet mt-[1px]">
              Dashboard
            </Label3>
          </Link>
          <TL2 noMargin className="text-comet">
            {machineName}
          </TL2>
        </Breadcrumbs>
        <Overview data={machine} onActionSuccess={reload} />
      </div>
      <div className="basis-3/4 max-w-3/4 flex flex-col mt-6">
        <div>
          <TL1 className="text-comet">Details</TL1>
          <Details data={machine} timezone={timezone} />
        </div>
        <div>
          <TL1 className="text-comet">Cash box & cassettes</TL1>
          <Cassettes
            refetchData={refetch}
            machine={machine}
            config={config ?? false}
            bills={bills}
          />
        </div>
        <div>
          <TL1 className="text-comet">Latest transactions</TL1>
          <Transactions id={machineID} />
        </div>
        <div>
          <TL1 className="text-comet">Commissions</TL1>
          <Commissions name={'commissions'} id={machineID} />
        </div>
      </div>
    </div>
  )
}

export default MachineRoute
