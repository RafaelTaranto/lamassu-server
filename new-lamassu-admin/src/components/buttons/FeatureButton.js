import React, { memo } from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

import styles from './FeatureButton.styles'

const useStyles = makeStyles(styles)

const FeatureButton = memo(({ className, Icon, InverseIcon, ...props }) => {
  const classes = useStyles()
  const classNames = {
    [classes.featureButton]: true,
    [classes.primary]: true
  }

  return (
    <button className={classnames(classNames, className)} {...props}>
      {Icon && <div className={classes.actionButtonIcon}><Icon /></div>}
      {InverseIcon &&
        <div className={classnames(classes.actionButtonIcon, classes.actionButtonIconActive)}>
          <InverseIcon />
        </div>}
    </button>
  )
})

export default FeatureButton
