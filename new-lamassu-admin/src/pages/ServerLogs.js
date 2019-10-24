import React, { useState } from 'react'
import _ from 'lodash/fp'
import moment from 'moment'
import useAxios from '@use-hooks/axios'
import FileSaver from 'file-saver'

import { Info3 } from '../components/typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '../components/table'
import { SimpleButton } from '../components/buttons'
import { Select } from '../components/inputs'
import Title from '../components/Title'

// import styles from './Logs.module.scss'
const styles = {}

const SHOW_ALL = 'Show all'

const formatDate = date => {
  return moment(date).format('YYYY-MM-DD HH:mm')
}

const formatDateFile = date => {
  return moment(date).format('YYYY-MM-DD_HH-mm')
}

const Logs = () => {
  const [machines, setMachines] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)
  const [logLevel, setLogLevel] = useState(SHOW_ALL)

  useAxios({
    url: 'http://localhost:8070/api/machines',
    method: 'GET',
    trigger: [],
    customHandler: (err, res) => {
      if (err) return
      if (res) {
        setMachines(res.data.machines)
        setSelected(_.get('data.machines[0]')(res))
      }
    }
  })

  const { response: logsResponse } = useAxios({
    url: `http://localhost:8070/api/logs/${_.get('deviceId', selected)}`,
    method: 'GET',
    trigger: selected,
    forceDispatchEffect: () => !!selected,
    customHandler: () => {
      setSaveMessage('')
    }
  })

  const { loading, reFetch: sendSnapshot } = useAxios({
    url: `http://localhost:8070/api/support_logs?deviceId=${_.get('deviceId')(selected)}`,
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
      <div className={styles.titleWrapper}>
        <Title>Server</Title>
        {logsResponse && (
          <div className={styles.buttonsWrapper}>
            <Info3>{saveMessage}</Info3>
            <SimpleButton
              className={styles.button}
              onClick={() => {
                const text = logsResponse.data.logs.map(it => JSON.stringify(it)).join('\n')
                const blob = new window.Blob([text], {
                  type: 'text/plain;charset=utf-8'
                })
                FileSaver.saveAs(blob, `${formatDateFile(new Date())}_${selected.name}`)
              }}
            >
              DL
            </SimpleButton>
            <SimpleButton className={styles.button} disabled={loading} onClick={sendSnapshot}>
              Share with Lamassu
            </SimpleButton>
          </div>
        )}
      </div>
      <div className={styles.wrapper}>
        {logsResponse && (
          <Select
            onSelectedItemChange={handleLogLevelChange}
            items={_.concat([SHOW_ALL], _.uniq(logsResponse.data.logs.map(log => log.logLevel)))}
            default={SHOW_ALL}
            selectedItem={logLevel}
          />
        )}
        <div className={styles.tableWrapper}>
          <Table className={styles.table}>
            <TableHead>
              <TableRow header>
                <TableHeader className={styles.dateColumn}>Date</TableHeader>
                <TableHeader className={styles.levelColumn}>Level</TableHeader>
                <TableHeader className={styles.fillColumn} />
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
