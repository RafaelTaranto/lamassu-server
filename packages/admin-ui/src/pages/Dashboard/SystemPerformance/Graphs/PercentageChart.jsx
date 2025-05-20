import classnames from 'classnames'
import React from 'react'
import { Label1 } from '../../../../components/typography/index'

const PercentageChart = ({ cashIn, cashOut }) => {
  const value = cashIn || cashOut !== 0 ? cashIn : 50

  const buildPercentageView = value => {
    if (value <= 15) return
    return <Label1 className="text-white">{value}%</Label1>
  }

  const percentageClasses = {
    'h-35 rounded-sm flex items-center justify-center': true,
    'min-w-2 rounded-xs': value < 5 && value > 0,
  }

  return (
    <div className="flex h-35 gap-1">
      <div
        className={classnames(percentageClasses, 'bg-java')}
        style={{ width: `${value}%` }}>
        {buildPercentageView(value, 'cashIn')}
      </div>
      <div
        className={classnames(percentageClasses, 'bg-neon')}
        style={{ width: `${100 - value}%` }}>
        {buildPercentageView(100 - value, 'cashOut')}
      </div>
    </div>
  )
}

export default PercentageChart
