import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState } from 'react'
import { H4 } from 'src/components/typography'

const ranges = ['Month', 'Week', 'Day']

const Nav = ({ handleSetRange, showPicker }) => {
  const [clickedItem, setClickedItem] = useState('Day')

  const isSelected = R.equals(clickedItem)
  const handleClick = range => {
    setClickedItem(range)
    handleSetRange(range)
  }

  return (
    <div className="flex justify-between items-center">
      <H4 noMargin>{'System performance'}</H4>
      {showPicker && (
        <div className="flex gap-6">
          {ranges.map((it, idx) => {
            return (
              <div
                key={idx}
                onClick={e => handleClick(e.target.innerText)}
                className={classnames({
                  'cursor-pointer text-comet': true,
                  'font-bold text-zodiac border-b-zodiac border-b-2':
                    isSelected(it),
                })}>
                {it}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Nav
