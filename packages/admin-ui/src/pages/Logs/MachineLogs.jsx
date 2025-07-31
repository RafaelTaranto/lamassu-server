import { useQuery, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import LogsDowloaderPopover from '../../components/LogsDownloaderPopper.jsx'
import Title from '../../components/Title.jsx'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { Info3, H4 } from '../../components/typography/index.jsx'

import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '../../components/table/index.js'
import { formatDate } from '../../utils/timezones.js'

import classes from './Logs.module.css'

const GET_MACHINES = gql`
  {
    machines {
      name
      deviceId
    }
  }
`

const NUM_LOG_RESULTS = 500

const GET_MACHINE_LOGS_CSV = gql`
  query MachineLogs(
    $deviceId: ID!
    $limit: Int
    $from: DateTimeISO
    $until: DateTimeISO
    $timezone: String
  ) {
    machineLogsCsv(
      deviceId: $deviceId
      limit: $limit
      from: $from
      until: $until
      timezone: $timezone
    )
  }
`

const GET_MACHINE_LOGS = gql`
  query MachineLogs(
    $deviceId: ID!
    $limit: Int
    $from: DateTimeISO
    $until: DateTimeISO
  ) {
    machineLogs(
      deviceId: $deviceId
      limit: $limit
      from: $from
      until: $until
    ) {
      logLevel
      id
      timestamp
      message
    }
  }
`

const GET_DATA = gql`
  query getData {
    configWithAllTriggers
  }
`

const Logs = () => {
  const [selected, setSelected] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  const deviceId = selected?.deviceId

  const { data: machineResponse, loading: machinesLoading } =
    useQuery(GET_MACHINES)

  const { data: configResponse, loading: configLoading } = useQuery(GET_DATA)
  const timezone = R.path(
    ['configWithAllTriggers', 'locale_timezone'],
    configResponse,
  )

  const { data: logsResponse, loading: logsLoading } = useQuery(
    GET_MACHINE_LOGS,
    {
      variables: { deviceId, limit: NUM_LOG_RESULTS },
      skip: !selected,
      onCompleted: () => setSaveMessage(''),
    },
  )

  if (machineResponse?.machines?.length && !selected) {
    setSelected(machineResponse?.machines[0])
  }

  const isSelected = it => {
    return R.path(['deviceId'])(selected) === it.deviceId
  }

  const loading = machinesLoading || configLoading || logsLoading

  return (
    <>
      <div className={classes.titleWrapper}>
        <div className={classes.titleAndButtonsContainer}>
          <Title>Machine logs</Title>
          {logsResponse && (
            <div className={classes.buttonsWrapper}>
              <LogsDowloaderPopover
                title="Download logs"
                name={selected.name}
                query={GET_MACHINE_LOGS_CSV}
                args={{ deviceId, timezone }}
                getLogs={logs => R.path(['machineLogsCsv'])(logs)}
                timezone={timezone}
              />
              <Info3>{saveMessage}</Info3>
            </div>
          )}
        </div>
      </div>
      <div className={classes.wrapper}>
        <Sidebar
          displayName={it => it.name}
          data={machineResponse?.machines || []}
          isSelected={isSelected}
          onClick={setSelected}
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow header>
                <TableHeader className={classes.dateColumn}>Date</TableHeader>
                <TableHeader className={classes.levelColumn}>Level</TableHeader>
                <TableHeader className={classes.fillColumn} />
              </TableRow>
            </TableHead>
            <TableBody>
              {logsResponse &&
                logsResponse.machineLogs.map((log, idx) => (
                  <TableRow key={idx} size="sm">
                    <TableCell>
                      {timezone &&
                        formatDate(log.timestamp, timezone, 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>{log.logLevel}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {loading && <H4>{'Loading...'}</H4>}
          {!loading && !logsResponse?.machineLogs?.length && (
            <H4>{'No activity so far'}</H4>
          )}
        </div>
      </div>
    </>
  )
}

export default Logs
