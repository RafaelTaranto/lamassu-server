import { useLazyQuery } from '@apollo/client'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import classnames from 'classnames'
import { format, set } from 'date-fns/fp'
import FileSaver from 'file-saver'
import * as R from 'ramda'
import React, { useState, useCallback } from 'react'
import Arrow from 'src/styling/icons/arrow/download_logs.svg?react'
import DownloadInverseIcon from 'src/styling/icons/button/download/white.svg?react'
import Download from 'src/styling/icons/button/download/zodiac.svg?react'

import { FeatureButton, Link } from 'src/components/buttons'
import { formatDate } from 'src/utils/timezones'

import Popper from './Popper'
import DateRangePicker from './date-range-picker/DateRangePicker'
import { RadioGroup } from './inputs'
import typographyStyles from './typography/styles'
import { H4, Info1, Label1, Label2 } from './typography/index.jsx'

const DateContainer = ({ date, children }) => {
  return (
    <div className="h-11 w-25">
      <Label1 noMargin>{children}</Label1>
      {date && (
        <>
          <div className="flex">
            <Info1 noMargin className="mr-2">
              {format('d', date)}
            </Info1>
            <div className="flex flex-col">
              <Label2 noMargin>{`${format(
                'MMM',
                date
              )} ${format('yyyy', date)}`}</Label2>
              <Label1 noMargin className="text-comet">
                {format('EEEE', date)}
              </Label1>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const ALL = 'all'
const RANGE = 'range'
const ADVANCED = 'advanced'
const SIMPLIFIED = 'simplified'

const LogsDownloaderPopover = ({
  name,
  query,
  args,
  title,
  getLogs,
  timezone,
  simplified,
  className
}) => {
  const [selectedRadio, setSelectedRadio] = useState(ALL)
  const [selectedAdvancedRadio, setSelectedAdvancedRadio] = useState(ADVANCED)

  const [range, setRange] = useState({ from: null, until: null })
  const [anchorEl, setAnchorEl] = useState(null)
  const [fetchLogs] = useLazyQuery(query, {
    onCompleted: data => createLogsFile(getLogs(data), range)
  })

  const dateRangePickerClasses = {
    'block h-full': selectedRadio === RANGE,
    hidden: selectedRadio === ALL
  }

  const handleRadioButtons = evt => {
    const selectedRadio = R.path(['target', 'value'])(evt)
    setSelectedRadio(selectedRadio)
    if (selectedRadio === ALL) setRange({ from: null, until: null })
  }

  const handleAdvancedRadioButtons = evt => {
    const selectedAdvancedRadio = R.path(['target', 'value'])(evt)
    setSelectedAdvancedRadio(selectedAdvancedRadio)
  }

  const handleRangeChange = useCallback(
    (from, until) => {
      setRange({ from, until })
    },
    [setRange]
  )

  const downloadLogs = (range, args) => {
    if (selectedRadio === ALL) {
      fetchLogs({
        variables: {
          ...args,
          simplified: selectedAdvancedRadio === SIMPLIFIED,
          excludeTestingCustomers: true
        }
      })
    }

    if (!range || !range.from) return
    if (range.from && !range.until) range.until = new Date()

    if (selectedRadio === RANGE) {
      fetchLogs({
        variables: {
          ...args,
          from: range.from,
          until: range.until,
          simplified: selectedAdvancedRadio === SIMPLIFIED,
          excludeTestingCustomers: true
        }
      })
    }
  }

  const createLogsFile = (logs, range) => {
    const formatDateFile = date => {
      return formatDate(date, timezone, 'yyyy-MM-dd_HH-mm')
    }

    const blob = new window.Blob([logs], {
      type: 'text/plain;charset=utf-8'
    })

    FileSaver.saveAs(
      blob,
      selectedRadio === ALL
        ? `${formatDateFile(new Date())}_${name}.csv`
        : `${formatDateFile(range.from)}_${formatDateFile(
            range.until
          )}_${name}.csv`
    )
  }

  const handleOpenRangePicker = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClickAway = () => {
    setAnchorEl(null)
  }

  const radioButtonOptions = [
    { display: 'All logs', code: ALL },
    { display: 'Date range', code: RANGE }
  ]

  const advancedRadioButtonOptions = [
    { display: 'Advanced logs', code: ADVANCED },
    { display: 'Simplified logs', code: SIMPLIFIED }
  ]

  const open = Boolean(anchorEl)
  const id = open ? 'date-range-popover' : undefined

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={className}>
        <FeatureButton
          Icon={Download}
          InverseIcon={DownloadInverseIcon}
          onClick={handleOpenRangePicker}
          variant="contained"
        />
        <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom">
          <div className="w-70">
            <H4 noMargin className="p-4 pb-0">
              {title}
            </H4>
            <div className="py-1 px-4">
              <RadioGroup
                name="logs-select"
                value={selectedRadio}
                options={radioButtonOptions}
                ariaLabel="logs-select"
                onChange={handleRadioButtons}
                className="flex flex-row justify-between text-zodiac"
              />
            </div>
            {selectedRadio === RANGE && (
              <div className={classnames(dateRangePickerClasses)}>
                <div className="flex justify-between items-center py-0 px-4 bg-zircon relative min-h-20">
                  {range && (
                    <>
                      <DateContainer date={range.from}>From</DateContainer>
                      <div className="absolute left-31 top-6">
                        <Arrow className="m-auto" />
                      </div>
                      <DateContainer date={range.until}>To</DateContainer>
                    </>
                  )}
                </div>
                <DateRangePicker
                  maxDate={set(
                    {
                      hours: 23,
                      minutes: 59,
                      seconds: 59,
                      milliseconds: 999
                    },
                    new Date()
                  )}
                  onRangeChange={handleRangeChange}
                />
              </div>
            )}
            {simplified && (
              <div className="py-1 px-4">
                <RadioGroup
                  name="simplified-tx-logs"
                  value={selectedAdvancedRadio}
                  options={advancedRadioButtonOptions}
                  ariaLabel="simplified-tx-logs"
                  onChange={handleAdvancedRadioButtons}
                  className="flex flex-row justify-between text-zodiac"
                />
              </div>
            )}
            <div className="py-3 px-4">
              <Link color="primary" onClick={() => downloadLogs(range, args)}>
                Download
              </Link>
            </div>
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  )
}

export default LogsDownloaderPopover
