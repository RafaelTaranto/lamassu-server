import classnames from 'classnames'
import React from 'react'

import styles from './typography.module.css'

function H1({ children, noMargin, className, ...props }) {
  const classNames = {
    [styles.h1]: true,
    [styles.noMargin]: noMargin,
    [className]: !!className,
  }

  return (
    <h1 className={classnames(classNames)} {...props}>
      {children}
    </h1>
  )
}

function H2({ children, noMargin, className, ...props }) {
  const classNames = {
    [styles.h2]: true,
    [styles.noMargin]: noMargin,
    [className]: !!className,
  }

  return (
    <h2 className={classnames(classNames)} {...props}>
      {children}
    </h2>
  )
}

function H3({ children, noMargin, className, ...props }) {
  const classNames = {
    [styles.h3]: true,
    [styles.noMargin]: noMargin,
    [className]: !!className,
  }

  return (
    <h3 className={classnames(classNames)} {...props}>
      {children}
    </h3>
  )
}

function H4({ children, noMargin, className, ...props }) {
  const classNames = {
    [styles.h4]: true,
    [styles.noMargin]: noMargin,
    [className]: !!className,
  }

  return (
    <h4 className={classnames(classNames)} {...props}>
      {children}
    </h4>
  )
}

function H5({ children, noMargin, className, ...props }) {
  const classNames = {
    [styles.h5]: true,
    [styles.noMargin]: noMargin,
    [className]: !!className,
  }

  return (
    <h5 className={classnames(classNames)} {...props}>
      {children}
    </h5>
  )
}

const P = pBuilder('p')
const Info1 = pBuilder('info1')
const Info2 = pBuilder('info2')
const Info3 = pBuilder('info3')
const Mono = pBuilder('mono')
const TL1 = pBuilder('tl1')
const TL2 = pBuilder('tl2')
const Label1 = pBuilder('label1')
const Label2 = pBuilder('label2')
const Label3 = pBuilder('label3')

function pBuilder(elementClass) {
  return ({ inline, noMargin, className, children, ...props }) => {
    const classNames = {
      [className]: !!className,
      [styles[elementClass]]: elementClass,
      [styles.inline]: inline,
      [styles.noMargin]: noMargin,
    }
    return (
      <p className={classnames(classNames)} {...props}>
        {children}
      </p>
    )
  }
}

export {
  H1,
  H2,
  H3,
  H4,
  H5,
  TL1,
  TL2,
  P,
  Info1,
  Info2,
  Info3,
  Mono,
  Label1,
  Label2,
  Label3,
}
