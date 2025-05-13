import { useQuery, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState, useRef } from 'react'
import LogsDowloaderPopover from '../../components/LogsDownloaderPopper.jsx'
import Title from '../../components/Title.jsx'
import Uptime from './Uptime.jsx'
import { Info3, H4 } from '../../components/typography/index.jsx'

import { Select } from '../../components/inputs/index.js'
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '../../components/table/index.js'
import { startCase } from '../../utils/string.js'
import { formatDate } from '../../utils/timezones.js'

import logsClasses from './Logs.module.css'
import classes from './ServerLogs.module.css'

const SHOW_ALL = { code: 'SHOW_ALL', display: 'Show all' }

const NUM_LOG_RESULTS = 500

const GET_CSV = gql`
  query ServerData(
    $limit: Int
    $from: DateTimeISO
    $until: DateTimeISO
    $timezone: String
  ) {
    serverLogsCsv(
      limit: $limit
      from: $from
      until: $until
      timezone: $timezone
    )
  }
`

const GET_SERVER_DATA = gql`
  query ServerData($limit: Int, $from: DateTimeISO, $until: DateTimeISO) {
    serverVersion
    uptime {
      name
      state
      uptime
    }
    serverLogs(limit: $limit, from: $from, until: $until) {
      logLevel
      id
      timestamp
      message
    }
  }
`

const GET_DATA = gql`
  query getData {
    config
  }
`

const Logs = () => {
  const tableEl = useRef()

  const [saveMessage, setSaveMessage] = useState(null)
  const [logLevel, setLogLevel] = useState(SHOW_ALL)

  const { data, loading: dataLoading } = useQuery(GET_SERVER_DATA, {
    onCompleted: () => setSaveMessage(''),
    variables: {
      limit: NUM_LOG_RESULTS,
    },
  })
  const { data: configResponse, loading: configLoading } = useQuery(GET_DATA)
  const timezone = R.path(['config', 'locale_timezone'], configResponse)

  const defaultLogLevels = [
    { code: 'error', display: 'Error' },
    { code: 'info', display: 'Info' },
    { code: 'debug', display: 'Debug' },
  ]
  const serverVersion = data?.serverVersion
  const processStates = data?.uptime ?? []

  const getLogLevels = R.compose(
    R.prepend(SHOW_ALL),
    R.uniq,
    R.concat(defaultLogLevels),
    R.map(it => ({
      code: R.path(['logLevel'])(it),
      display: startCase(R.path(['logLevel'])(it)),
    })),
    R.path(['serverLogs']),
  )

  const handleLogLevelChange = logLevel => {
    if (tableEl.current) tableEl.current.scrollTo(0, 0)

    setLogLevel(logLevel)
  }

  const loading = dataLoading || configLoading

  return (
    <>
      <div className={logsClasses.titleWrapper}>
        <div className={logsClasses.titleAndButtonsContainer}>
          <Title>Server</Title>
          {data && (
            <div className={logsClasses.buttonsWrapper}>
              <LogsDowloaderPopover
                title="Download logs"
                name="server-logs"
                query={GET_CSV}
                args={{ timezone }}
                logs={data.serverLogs}
                getLogs={logs => R.path(['serverLogsCsv'])(logs)}
                timezone={timezone}
              />
              <Info3>{saveMessage}</Info3>
            </div>
          )}
        </div>
        <div className={classes.serverVersion}>
          {serverVersion && <span>Server version: v{serverVersion}</span>}
        </div>
      </div>
      <div className={classes.headerLine2}>
        {data && (
          <Select
            onSelectedItemChange={handleLogLevelChange}
            label="Level"
            items={getLogLevels(data)}
            default={SHOW_ALL}
            selectedItem={logLevel}
          />
        )}
        <div className={classes.uptimeContainer}>
          {processStates &&
            processStates.map((process, idx) => (
              <Uptime key={idx} process={process} />
            ))}
        </div>
      </div>
      <div className={logsClasses.wrapper}>
        <div ref={tableEl} className={classes.serverTableWrapper}>
          <Table className={logsClasses.table}>
            <TableHead>
              <TableRow header>
                <TableHeader className={logsClasses.dateColumn}>
                  Date
                </TableHeader>
                <TableHeader className={logsClasses.levelColumn}>
                  Level
                </TableHeader>
                <TableHeader className={logsClasses.fillColumn} />
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.serverLogs
                  .filter(
                    log =>
                      logLevel === SHOW_ALL || log.logLevel === logLevel.code,
                  )
                  .map((log, idx) => (
                    <TableRow key={idx} size="sm">
                      <TableCell>
                        {timezone &&
                          formatDate(
                            log.timestamp,
                            timezone,
                            'yyyy-MM-dd HH:mm',
                          )}
                      </TableCell>
                      <TableCell>{log.logLevel}</TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {loading && <H4>{'Loading...'}</H4>}
          {!loading && !data?.serverLogs?.length && (
            <H4>{'No activity so far'}</H4>
          )}
        </div>
      </div>
    </>
  )
}

export default Logs
