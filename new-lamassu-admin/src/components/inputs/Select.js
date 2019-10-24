import React from 'react'
import { useSelect } from 'downshift'
import _ from 'lodash/fp'
import classnames from 'classnames'

import { ReactComponent as Arrowdown } from '../../styling/icons/action/arrow/regular.svg'

import styles from './Select.styles'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(styles)

function Select ({ items, ...props }) {
  const classes = useStyles()

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps
  } = useSelect({
    items,
    selectedItem: props.selectedItem,
    onSelectedItemChange: item => {
      props.onSelectedItemChange(item.selectedItem)
    }
  })

  const selectClassNames = {
    [classes.select]: true,
    [classes.selectFiltered]: selectedItem !== props.default
  }

  return (
    <div className={classnames(selectClassNames)}>
      <label {...getLabelProps()}>Level</label>
      <button
        {...getToggleButtonProps()}
        style={isOpen ? { borderRadius: '16px 16px 0 0' } : {}}
      >
        {_.capitalize(selectedItem)} <Arrowdown />
      </button>
      <ul {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {_.capitalize(item)}
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Select
