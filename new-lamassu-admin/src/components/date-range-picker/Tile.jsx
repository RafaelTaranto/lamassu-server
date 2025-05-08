import classnames from 'classnames'
import React from 'react'

import classes from './Tile.module.css'

const Tile = ({
  isLowerBound,
  isUpperBound,
  isBetween,
  isDisabled,
  children
}) => {
  const selected = isLowerBound || isUpperBound

  const rangeClasses = {
    [classes.between]: isBetween && !(isLowerBound && isUpperBound),
    [classes.lowerBound]: isLowerBound && !isUpperBound,
    [classes.upperBound]: isUpperBound && !isLowerBound
  }

  const buttonWrapperClasses = {
    [classes.wrapper]: true,
    [classes.selected]: selected
  }

  const buttonClasses = {
    [classes.button]: true,
    [classes.disabled]: isDisabled
  }

  return (
    <div className={classes.wrapper}>
      <div className={classnames(rangeClasses)} />
      <div className={classnames(buttonWrapperClasses)}>
        <button className={classnames(buttonClasses)}>{children}</button>
      </div>
    </div>
  )
}

export default Tile
