import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import classnames from 'classnames'
import React from 'react'

import { Link } from '../buttons'
import styles from './Table.module.css'

const Table = ({ children, className, ...props }) => (
  <div className={classnames(className)} {...props}>
    {children}
  </div>
)

const THead = ({ children, className }) => {
  return <div className={classnames(className, styles.header)}>{children}</div>
}

const TDoubleLevelHead = ({ children, className }) => {
  return (
    <div className={classnames(className, styles.doubleHeader)}>{children}</div>
  )
}

const TBody = ({ children, className }) => {
  return <div className={classnames(className)}>{children}</div>
}

const Td = ({
  style = {},
  children,
  header,
  className,
  width = 100,
  size,
  bold,
  textAlign,
  action,
}) => {
  const inlineStyle = {
    ...style,
    width,
    textAlign,
    fontSize: size === 'sm' ? '14px' : size === 'lg' ? '24px' : '',
  }

  const cssClasses = {
    [styles.td]: !header,
    [styles.tdHeader]: header,
    'font-bold': !header && (bold || size === 'lg'),
    [styles.actionCol]: action,
  }

  return (
    <div
      data-cy={`td-${header}`}
      className={classnames(className, cssClasses)}
      style={inlineStyle}>
      {children}
    </div>
  )
}

const Th = ({ children, ...props }) => {
  return (
    <Td header {...props}>
      {children}
    </Td>
  )
}

const ThDoubleLevel = ({ title, children, className, width }) => {
  return (
    <div
      className={classnames(className, styles.thDoubleLevel)}
      style={{ width }}>
      <div className={styles.thDoubleLevelFirst}>{title}</div>
      <div>{children}</div>
    </div>
  )
}

const Tr = ({
  onClick,
  error,
  errorMessage,
  shouldShowError,
  children,
  className,
  size,
  newRow,
}) => {
  const inlineStyle = {
    minHeight: size === 'sm' ? '34px' : size === 'lg' ? '68px' : '48px',
  }
  const cardClasses = {
    [styles.card]: true,
    [styles.trError]: error,
    [styles.trAdding]: newRow,
  }

  const mainContentClasses = {
    [styles.mainContent]: true,
    [styles.sizeSm]: size === 'sm',
    [styles.sizeLg]: size === 'lg',
  }

  return (
    <>
      <Card className={classnames(className, cardClasses)} onClick={onClick}>
        <CardContent className={styles.cardContentRoot}>
          <div className={classnames(mainContentClasses)} style={inlineStyle}>
            {children}
          </div>
          {error && shouldShowError && (
            <div className={styles.errorContent}>{errorMessage}</div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

const EditCell = ({ save, cancel }) => (
  <Td>
    <Link style={{ marginRight: '20px' }} color="secondary" onClick={cancel}>
      Cancel
    </Link>
    <Link color="primary" onClick={save}>
      Save
    </Link>
  </Td>
)

export {
  Table,
  THead,
  TDoubleLevelHead,
  TBody,
  Tr,
  Td,
  Th,
  ThDoubleLevel,
  EditCell,
}
