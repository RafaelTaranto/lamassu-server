import classnames from 'classnames'
import * as R from 'ramda'
import React, { memo } from 'react'
import CompleteStageIconSpring from 'src/styling/icons/stage/spring/complete.svg?react'
import CurrentStageIconSpring from 'src/styling/icons/stage/spring/current.svg?react'
import EmptyStageIconSpring from 'src/styling/icons/stage/spring/empty.svg?react'
import CompleteStageIconZodiac from 'src/styling/icons/stage/zodiac/complete.svg?react'
import CurrentStageIconZodiac from 'src/styling/icons/stage/zodiac/current.svg?react'
import EmptyStageIconZodiac from 'src/styling/icons/stage/zodiac/empty.svg?react'

import classes from './Stepper.module.css'

const Stepper = memo(({ steps, currentStep, color = 'spring', className }) => {
  if (currentStep < 1 || currentStep > steps)
    throw Error('Value of currentStage is invalid')
  if (steps < 1) throw Error('Value of stages is invalid')

  const separatorClasses = {
    'w-7 h-[2px] border-2 z-1': true,
    'border-spring': color === 'spring',
    'border-zodiac': color === 'zodiac'
  }

  const separatorEmptyClasses = {
    'w-7 h-[2px] border-2 z-1': true,
    'border-dust': color === 'spring',
    'border-comet': color === 'zodiac'
  }

  return (
    <div className={classnames(className, 'flex items-center')}>
      {R.range(1, currentStep).map(idx => (
        <div key={idx} className="flex items-center m-0">
          {idx > 1 && <div className={classnames(separatorClasses)} />}
          <div className={classes.stage}>
            {color === 'spring' && <CompleteStageIconSpring />}
            {color === 'zodiac' && <CompleteStageIconZodiac />}
          </div>
        </div>
      ))}
      <div className="flex items-center m-0">
        {currentStep > 1 && <div className={classnames(separatorClasses)} />}
        <div className={classes.stage}>
          {color === 'spring' && <CurrentStageIconSpring />}
          {color === 'zodiac' && <CurrentStageIconZodiac />}
        </div>
      </div>
      {R.range(currentStep + 1, steps + 1).map(idx => (
        <div key={idx} className="flex items-center m-0">
          <div className={classnames(separatorEmptyClasses)} />
          <div className={classes.stage}>
            {color === 'spring' && <EmptyStageIconSpring />}
            {color === 'zodiac' && <EmptyStageIconZodiac />}
          </div>
        </div>
      ))}
    </div>
  )
})

export default Stepper
