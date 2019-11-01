import React, { useState } from 'react'
import { get, concat, uniq } from 'lodash/fp'
import moment from 'moment'
import useAxios from '@use-hooks/axios'

import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '../components/table'
import { Select } from '../components/inputs'
import Uptime from '../components/Uptime'
import LogPageHeader from '../components/LogPageHeader'
import { makeStyles } from '@material-ui/core'
import typographyStyles from '../components/typography/styles'

import { zircon, comet, white, fontSecondary } from '../styling/variables'
import styles from './Logs.styles'

const { regularLabel } = typographyStyles
const { tableWrapper } = styles

styles.titleWrapper = {
  display: 'flex',
  justifyContent: 'space-between'
}

styles.serverTableWrapper = {
  extend: tableWrapper,
  maxWidth: '100%',
  marginLeft: 0
}

styles.serverVersion = {
  extend: regularLabel,
  color: comet,
  margin: 'auto 0 auto 0'
}

styles.headerLine2 = {
  height: 60,
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 24
}

styles.uptimeContainer = {
  margin: 'auto 0 auto 0'
}

const useStyles = makeStyles(styles)

const SHOW_ALL = 'Show all'

const formatDate = date => {
  return moment(date).format('YYYY-MM-DD HH:mm')
}

const Logs = () => {
  const [saveMessage, setSaveMessage] = useState(null)
  const [logLevel, setLogLevel] = useState(SHOW_ALL)
  const [version, setVersion] = useState(null)
  const [processStates, setProcessStates] = useState(null)

  const classes = useStyles()

  useAxios({
    url: 'http://localhost:8070/api/version',
    method: 'GET',
    trigger: [],
    customHandler: (err, res) => {
      if (err) return
      if (res) {
        setVersion(res.data)
      }
    }
  })

  useAxios({
    url: 'http://localhost:8070/api/uptimes',
    method: 'GET',
    trigger: [],
    customHandler: (err, res) => {
      if (err) return
      if (res) {
        setProcessStates(res.data)
        console.log(res.data)
      }
    }
  })

  const { response: logsResponse } = useAxios({
    url: 'http://localhost:8070/api/server_logs/',
    method: 'GET',
    trigger: [],
    customHandler: () => {
      setSaveMessage('')
    }
  })

  const { loading, reFetch: sendSnapshot } = useAxios({
    url: 'http://localhost:8070/api/server_support_logs',
    method: 'POST',
    customHandler: (err, res) => {
      if (err) {
        setSaveMessage('Failure saving snapshot')
        throw err
      }
      setSaveMessage('✓ Saved latest snapshot')
    }
  })

  const handleLogLevelChange = (item) => setLogLevel(item)

  return (
    <>
      <div className={classes.titleWrapper}>
        <LogPageHeader
          logsResponse={logsResponse}
          saveMessage={saveMessage}
          loading={loading}
          sendSnapshot={sendSnapshot}
        >
          Server
        </LogPageHeader>
        <div className={classes.serverVersion}>
          {version && (
            <span>Server version: v{version}</span>
          )}
        </div>
      </div>
      <div className={classes.headerLine2}>
        {logsResponse && (
          <Select
            onSelectedItemChange={handleLogLevelChange}
            label='Level'
            items={concat([SHOW_ALL], uniq(logsResponse.data.logs.map(log => log.logLevel)))}
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
      <div className={classes.wrapper}>
        <div className={classes.serverTableWrapper}>
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
                logsResponse.data.logs.filter(log => logLevel === SHOW_ALL || log.logLevel === logLevel).map((log, idx) => (
                  <TableRow key={idx} size='sm'>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.logLevel}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

export default Logs
