import classnames from 'classnames'
import { useSelect } from 'downshift'
import * as R from 'ramda'
import React from 'react'
import Arrowdown from 'src/styling/icons/action/arrow/regular.svg?react'

import styles from './Select.module.css'

function Select({ className, label, items, ...props }) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    selectedItem: props.selectedItem,
    onSelectedItemChange: item => {
      props.onSelectedItemChange(item.selectedItem)
    },
  })

  const selectClassNames = {
    [styles.select]: true,
    [styles.selectFiltered]: props.defaultAsFilter
      ? true
      : !R.equals(selectedItem, props.default),
    [styles.open]: isOpen,
  }

  return (
    <div className={classnames(selectClassNames, className)}>
      <label {...getLabelProps()}>{label}</label>
      <button {...getToggleButtonProps()}>
        <span className={styles.selectedItem}>{selectedItem.display}</span>
        <Arrowdown />
      </button>
      <ul {...getMenuProps()}>
        {isOpen &&
          items.map(({ code, display }, index) => (
            <li key={`${code}${index}`} {...getItemProps({ code, index })}>
              <span>{display}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Select
