import { useQuery, gql } from '@apollo/client'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import * as R from 'ramda'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { Status } from 'src/components/Status'
import { Label2, TL2 } from 'src/components/typography'
import TxOutIcon from 'src/styling/icons/direction/cash-out.svg?react'
import MachineLinkIcon from 'src/styling/icons/month arrows/right.svg?react'

import { fromNamespace } from 'src/utils/config'

// percentage threshold where below this number the text in the cash cassettes percentage turns red
const PERCENTAGE_THRESHOLD = 20

const GET_CONFIG = gql`
  query getConfig {
    config
  }
`

const StyledCell = styled(TableCell)({
  borderBottom: '4px solid white',
  padding: 0,
  paddingLeft: '15px'
})

const HeaderCell = styled(TableCell)({
  borderBottom: '4px solid white',
  padding: 0,
  paddingLeft: '15px',
  backgroundColor: 'white'
})

const MachinesTable = ({ machines = [], numToRender }) => {
  const history = useHistory()

  const { data } = useQuery(GET_CONFIG)
  const fillingPercentageSettings = fromNamespace(
    'notifications',
    R.path(['config'], data) ?? {}
  )

  const getPercent = (notes, capacity = 500) => {
    return Math.round((notes / capacity) * 100)
  }

  const makePercentageText = (cassetteIdx, notes, capacity = 500) => {
    const percent = getPercent(notes, capacity)
    const percentageThreshold = R.pipe(
      R.path([`fillingPercentageCassette${cassetteIdx}`]),
      R.defaultTo(PERCENTAGE_THRESHOLD)
    )(fillingPercentageSettings)
    return percent < percentageThreshold ? (
      <TL2 className="text-tomato">{`${percent}%`}</TL2>
    ) : (
      <TL2>{`${percent}%`}</TL2>
    )
  }

  const redirect = ({ name, deviceId }) => {
    return history.push(`/machines/${deviceId}`, {
      selectedMachine: name
    })
  }

  const maxNumberOfCassettes = Math.max(
    ...R.map(it => it.numberOfCassettes, machines),
    0
  )

  return (
    <TableContainer className="max-h-110">
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>
              <div className="flex items-center">
                <Label2 noMargin className="text-comet">
                  Machines
                </Label2>
              </div>
            </HeaderCell>
            <HeaderCell>
              <div className="flex items-center">
                <Label2 noMargin className="text-comet">
                  Status
                </Label2>
              </div>
            </HeaderCell>
            {R.times(R.identity, maxNumberOfCassettes).map((it, idx) => (
              <HeaderCell key={idx}>
                <div className="flex items-center whitespace-pre">
                  <TxOutIcon />
                  <Label2 noMargin className="text-comet">
                    {' '}
                    {it + 1}
                  </Label2>
                </div>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {machines.map((machine, idx) => {
            if (idx < numToRender) {
              return (
                <TableRow
                  onClick={() => redirect(machine)}
                  className="boder-b-0 bg-ghost"
                  key={machine.deviceId + idx}>
                  <TableCell
                    sx={{
                      borderBottom: '4px solid white',
                      padding: 0,
                      paddingLeft: '15px'
                    }}
                    align="left">
                    <div className="flex items-center">
                      <TL2>{machine.name}</TL2>
                      <MachineLinkIcon
                        className="cursor-pointer ml-2"
                        onClick={() => redirect(machine)}
                      />
                    </div>
                  </TableCell>
                  <StyledCell>
                    <Status status={machine.statuses[0]} />
                  </StyledCell>
                  {R.range(1, maxNumberOfCassettes + 1).map((it, idx) =>
                    machine.numberOfCassettes >= it ? (
                      <StyledCell key={idx} align="left">
                        {makePercentageText(
                          it,
                          machine.cashUnits[`cassette${it}`]
                        )}
                      </StyledCell>
                    ) : (
                      <StyledCell key={idx} align="left">
                        <TL2>{`— %`}</TL2>
                      </StyledCell>
                    )
                  )}
                </TableRow>
              )
            }
            return null
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default MachinesTable
