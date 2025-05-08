import Chip from '@mui/material/Chip'
import classnames from 'classnames'
import React from 'react'
import { Info2, Label1, Label2 } from 'src/components/typography'

import { numberToFiatAmount } from 'src/utils/number'

import classes from './Cashbox.module.css'
import { primaryColor as zodiac, tomato } from '../../../styling/variables.js'

const colors = {
  cashOut: {
    empty: tomato,
    full: zodiac
  },
  cashIn: {
    empty: zodiac,
    full: tomato
  }
}

const Cashbox = ({
  percent = 0,
  cashOut = false,
  width = 80,
  height = 118,
  className,
  emptyPartClassName,
  labelClassName,
  omitInnerPercentage,
  isLow
}) => {
  const ltHalf = percent <= 51
  const color =
    colors[cashOut ? 'cashOut' : 'cashIn'][!isLow ? 'full' : 'empty']

  return (
    <div
      style={{ height, width, backgroundColor: color, borderColor: color }}
      className={classnames(className, classes.cashbox)}>
      <div
        className={classnames(emptyPartClassName, classes.emptyPart)}
        style={{ height: `${100 - percent}%` }}>
        {!omitInnerPercentage && ltHalf && (
          <Label2
            style={{ color }}
            className={classnames(labelClassName, classes.emptyPartP)}>
            {percent.toFixed(0)}%
          </Label2>
        )}
      </div>
      <div style={{ backgroundColor: color }}>
        {!omitInnerPercentage && !ltHalf && (
          <Label2 className={classnames(classes.fullPartP, labelClassName)}>
            {percent.toFixed(0)}%
          </Label2>
        )}
      </div>
    </div>
  )
}

// https://support.lamassu.is/hc/en-us/articles/360025595552-Installing-the-Sintra-Forte
// Sintra and Sintra Forte can have up to 500 notes per cashOut box and up to 1000 per cashIn box
const CashIn = ({
  capacity = 500,
  currency,
  notes,
  className,
  editingMode = false,
  threshold,
  width,
  height,
  total,
  omitInnerPercentage
}) => {
  const percent = (100 * notes) / capacity
  const isLow = percent < threshold
  return (
    <>
      <div className={classes.row}>
        <div className={classes.col}>
          <Cashbox
            className={className}
            percent={percent}
            cashOut
            isLow={isLow}
            width={width}
            height={height}
            omitInnerPercentage={omitInnerPercentage}
          />
        </div>
        {!editingMode && (
          <div className={classes.col2}>
            <div className={classes.innerRow}>
              <Info2 className={classes.noMarginText}>{notes} notes</Info2>
            </div>
            <div className={classes.innerRow}>
              <Label1 className={classes.noMarginText}>
                {total} {currency.code}
              </Label1>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const CashOut = ({
  capacity = 500,
  denomination = 0,
  currency,
  notes,
  className,
  editingMode = false,
  threshold,
  width,
  height,
  omitInnerPercentage
}) => {
  const percent = (100 * notes) / capacity
  const isLow = percent < threshold
  return (
    <>
      <div className={classes.row}>
        <div className={classes.col}>
          <Cashbox
            className={className}
            percent={percent}
            cashOut
            isLow={isLow}
            width={width}
            height={height}
            omitInnerPercentage={omitInnerPercentage}
          />
        </div>
        {!editingMode && (
          <div className={classes.col2}>
            <div className={classes.innerRow}>
              <Info2 className={classes.noMarginText}>{notes}</Info2>
              <Chip label={`${denomination} ${currency.code}`} />
            </div>
            <div className={classes.innerRow}>
              <Label1 className={classes.noMarginText}>
                {numberToFiatAmount(notes * denomination)} {currency.code}
              </Label1>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const CashOutLite = ({
  capacity = 500,
  denomination = 0,
  currency,
  notes,
  threshold,
  width
}) => {
  const percent = (100 * notes) / capacity
  const isLow = percent < threshold
  return (
    <div className={classes.col}>
      <Cashbox
        percent={percent}
        cashOut
        isLow={isLow}
        width={width}
        height={15}
        omitInnerPercentage
      />
      <Chip label={`${denomination} ${currency.code}`} />
    </div>
  )
}

export { Cashbox, CashIn, CashOut, CashOutLite }
