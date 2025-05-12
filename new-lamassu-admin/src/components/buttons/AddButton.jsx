import classnames from 'classnames'
import React, { memo } from 'react'
import AddIcon from 'src/styling/icons/button/add/zodiac.svg?react'

import classes from './AddButton.module.css'

const SimpleButton = memo(({ className, children, ...props }) => {
  return (
    <button className={classnames(classes.button, className)} {...props}>
      <AddIcon />
      {children}
    </button>
  )
})

export default SimpleButton
