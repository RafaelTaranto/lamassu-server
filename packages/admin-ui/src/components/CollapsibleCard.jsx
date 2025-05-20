import PropTypes from 'prop-types'
import React from 'react'

import Paper from '@mui/material/Paper'
import classnames from 'classnames'

const cardState = Object.freeze({
  DEFAULT: 'default',
  SHRUNK: 'shrunk',
  EXPANDED: 'expanded',
})

const CollapsibleCard = ({ className, state, shrunkComponent, children }) => {
  return (
    <Paper className={classnames('p-6', className)}>
      {state === cardState.SHRUNK ? shrunkComponent : children}
    </Paper>
  )
}

CollapsibleCard.propTypes = {
  shrunkComponent: PropTypes.node.isRequired,
}

export default CollapsibleCard
export { cardState }
