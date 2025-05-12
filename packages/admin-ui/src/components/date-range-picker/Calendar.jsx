import {
  add,
  differenceInMonths,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isSameDay,
  isSameMonth,
  lastDayOfMonth,
  startOfMonth,
  startOfWeek,
  sub,
} from 'date-fns/fp'
import * as R from 'ramda'
import React, { useState } from 'react'
import Arrow from 'src/styling/icons/arrow/month_change.svg?react'
import RightArrow from 'src/styling/icons/arrow/month_change_right.svg?react'

import Tile from './Tile'
import classes from './Calendar.module.css'

const Calendar = ({ minDate, maxDate, handleSelect, ...props }) => {
  const [currentDisplayedMonth, setCurrentDisplayedMonth] = useState(new Date())

  const weekdays = Array.from(Array(7)).map((_, i) =>
    format('EEEEE', add({ days: i }, startOfWeek(new Date()))),
  )

  const monthLength = month => getDaysInMonth(month)

  const monthdays = month => {
    const lastMonth = sub({ months: 1 }, month)
    const lastMonthRange = R.range(0, getDay(startOfMonth(month))).reverse()
    const lastMonthDays = R.map(i =>
      sub({ days: i }, lastDayOfMonth(lastMonth)),
    )(lastMonthRange)

    const thisMonthRange = R.range(0, monthLength(month))
    const thisMonthDays = R.map(i => add({ days: i }, startOfMonth(month)))(
      thisMonthRange,
    )

    const nextMonth = add({ months: 1 }, month)
    const nextMonthRange = R.range(
      0,
      42 - lastMonthDays.length - thisMonthDays.length,
    )
    const nextMonthDays = R.map(i => add({ days: i }, startOfMonth(nextMonth)))(
      nextMonthRange,
    )

    return R.concat(R.concat(lastMonthDays, thisMonthDays), nextMonthDays)
  }

  const getRow = (month, row) => monthdays(month).slice(row * 7 - 7, row * 7)

  const handleNavPrev = currentMonth => {
    const prevMonth = sub({ months: 1 }, currentMonth)
    if (!minDate) setCurrentDisplayedMonth(prevMonth)
    else {
      setCurrentDisplayedMonth(
        isSameMonth(minDate, prevMonth) ||
          differenceInMonths(minDate, prevMonth) > 0
          ? prevMonth
          : currentDisplayedMonth,
      )
    }
  }
  const handleNavNext = currentMonth => {
    const nextMonth = add({ months: 1 }, currentMonth)
    if (!maxDate) setCurrentDisplayedMonth(nextMonth)
    else {
      setCurrentDisplayedMonth(
        isSameMonth(maxDate, nextMonth) ||
          differenceInMonths(nextMonth, maxDate) > 0
          ? nextMonth
          : currentDisplayedMonth,
      )
    }
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.navbar}>
        <button
          className={classes.button}
          onClick={() => handleNavPrev(currentDisplayedMonth)}>
          <Arrow />
        </button>
        <span>
          {`${format('MMMM', currentDisplayedMonth)} ${format(
            'yyyy',
            currentDisplayedMonth,
          )}`}
        </span>
        <button
          className={classes.button}
          onClick={() => handleNavNext(currentDisplayedMonth)}>
          <RightArrow />
        </button>
      </div>
      <table className={classes.table}>
        <thead>
          <tr>
            {weekdays.map((day, key) => (
              <th key={key}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {R.range(1, 8).map((row, key) => (
            <tr key={key}>
              {getRow(currentDisplayedMonth, row).map((day, key) => (
                <td key={key} onClick={() => handleSelect(day)}>
                  <Tile
                    isDisabled={
                      (maxDate && isAfter(maxDate, day)) ||
                      (minDate && isAfter(day, minDate))
                    }
                    isLowerBound={isSameDay(props.from, day)}
                    isUpperBound={isSameDay(props.to, day)}
                    isBetween={
                      isAfter(props.from, day) && isAfter(day, props.to)
                    }>
                    {format('d', day)}
                  </Tile>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Calendar
