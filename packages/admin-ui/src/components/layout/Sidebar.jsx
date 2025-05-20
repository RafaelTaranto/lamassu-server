import classnames from 'classnames'
import React from 'react'
import { P } from '../typography'
import CompleteStageIconZodiac from '../../styling/icons/stage/zodiac/complete.svg?react'
import CurrentStageIconZodiac from '../../styling/icons/stage/zodiac/current.svg?react'
import EmptyStageIconZodiac from '../../styling/icons/stage/zodiac/empty.svg?react'

import styles from './Sidebar.module.css'

const Sidebar = ({
  data,
  displayName,
  isSelected,
  onClick,
  children,
  itemRender,
  loading = false,
}) => {
  return (
    <div className={styles.sidebar}>
      {loading && <P>Loading...</P>}
      {!loading &&
        data?.map((it, idx) => (
          <div
            key={idx}
            className={styles.linkWrapper}
            onClick={() => onClick(it)}>
            <div
              className={classnames({
                [styles.activeLink]: isSelected(it),
                [styles.customRenderActiveLink]: itemRender && isSelected(it),
                [styles.customRenderLink]: itemRender,
                [styles.link]: true,
              })}>
              {itemRender ? itemRender(it, isSelected(it)) : displayName(it)}
            </div>
          </div>
        ))}
      {!loading && children}
    </div>
  )
}

export default Sidebar

const Stepper = ({ step, it, idx, steps }) => {
  const active = step === idx
  const past = idx < step
  const future = idx > step

  return (
    <div className={styles.item}>
      <span
        className={classnames({
          [styles.itemText]: true,
          [styles.itemTextActive]: active,
          [styles.itemTextPast]: past,
        })}>
        {it.label}
      </span>
      {active && <CurrentStageIconZodiac />}
      {past && <CompleteStageIconZodiac />}
      {future && <EmptyStageIconZodiac />}
      {idx < steps.length - 1 && (
        <div
          className={classnames({
            [styles.stepperPath]: true,
            [styles.stepperPast]: past,
          })}></div>
      )}
    </div>
  )
}

export { Stepper }
