import classnames from 'classnames'
import * as R from 'ramda'
import React, { useState, useEffect } from 'react'
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized'
import {
  Table,
  TBody,
  THead,
  Tr,
  Td,
  Th
} from 'src/components/fake-table/Table'
import { H4 } from 'src/components/typography'
import ExpandClosedIcon from 'src/styling/icons/action/expand/closed.svg?react'
import ExpandOpenIcon from 'src/styling/icons/action/expand/open.svg?react'

import { EmptyTable } from 'src/components/table'

const Row = ({
  id,
  index,
  elements,
  data,
  width,
  Details,
  expanded,
  expandRow,
  expWidth,
  expandable,
  onClick,
  size,
  ...props
}) => {
  const hasPointer = onClick || expandable
  const trClasses = {
    'cursor-pointer': hasPointer,
    'border-2 border-transparent': true,
    'border-2 border-zircon shadow-md': expanded
  }

  return (
    <div className="p-[1px]">
      <div
        data-cy={id}
        className={classnames({ 'pt-3': expanded && index !== 0 })}>
        <Tr
          size={size}
          className={classnames(trClasses)}
          onClick={() => {
            expandable && expandRow(id, data)
            onClick && onClick(data)
          }}
          error={data.error || data.hasError || data.batchError}
          shouldShowError={false}
          errorMessage={data.errorMessage || data.hasError || data.batchError}>
          {elements.map(({ view = it => it?.toString(), ...props }, idx) => (
            <Td key={idx} {...props}>
              {view(data)}
            </Td>
          ))}
          {expandable && (
            <Td width={expWidth} textAlign="center">
              <button
                onClick={() => expandRow(id, data)}
                className="outline-0 border-0 bg-transparent cursor-pointer p-1">
                {expanded && <ExpandOpenIcon />}
                {!expanded && <ExpandClosedIcon />}
              </button>
            </Td>
          )}
        </Tr>
      </div>
      {expanded && (
        <div className="pb-3">
          <Tr
            className={classnames({
              'border-2 border-zircon shadow-md': expanded
            })}>
            <Td width={width}>
              <Details it={data} timezone={props.timezone} />
            </Td>
          </Tr>
        </div>
      )}
    </div>
  )
}

const DataTable = ({
  elements = [],
  data = [],
  Details,
  className,
  tableClassName,
  expandable,
  initialExpanded,
  onClick,
  loading,
  maxWidth = 1200,
  emptyText,
  rowSize,
  ...props
}) => {
  const [expanded, setExpanded] = useState(initialExpanded)

  useEffect(() => setExpanded(initialExpanded), [initialExpanded])

  const coreWidth = R.compose(R.sum, R.map(R.prop('width')))(elements)
  const expWidth = maxWidth - coreWidth
  const width = coreWidth + (expandable ? expWidth : 0)

  const expandRow = (id, data) => {
    if (data.id) {
      cache.clear(data.id)
      setExpanded(data.id === expanded ? null : data.id)
    } else {
      cache.clear(id)
      setExpanded(id === expanded ? null : id)
    }
  }

  const cache = new CellMeasurerCache({
    defaultHeight: 58,
    fixedWidth: true
  })

  function rowRenderer({ index, key, parent, style }) {
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}>
        {({ registerChild }) => (
          <div ref={registerChild} style={style}>
            <Row
              width={width}
              size={rowSize}
              id={data[index].id ? data[index].id : index}
              index={index}
              expWidth={expWidth}
              elements={elements}
              data={data[index]}
              Details={Details}
              expanded={
                data[index].id
                  ? data[index].id === expanded
                  : index === expanded
              }
              expandRow={expandRow}
              expandable={expandable}
              onClick={onClick}
              timezone={props.timezone}
            />
          </div>
        )}
      </CellMeasurer>
    )
  }

  return (
    <div
      className={classnames({
        'flex flex-1 flex-col': true,
        [className]: !!className
      })}>
      <Table
        className={classnames(
          'mb-12 min-h-50 flex-1 flex flex-col',
          tableClassName
        )}
        style={{ width }}>
        <THead>
          {elements.map(({ width, className, textAlign, header }, idx) => (
            <Th
              key={idx}
              width={width}
              className={className}
              textAlign={textAlign}>
              {header}
            </Th>
          ))}
          {expandable && <Th width={expWidth}></Th>}
        </THead>
        <TBody className="flex-auto">
          {loading && <H4>Loading...</H4>}
          {!loading && R.isEmpty(data) && <EmptyTable message={emptyText} />}
          {!loading && !R.isEmpty(data) && (
            <AutoSizer disableWidth>
              {({ height }) => (
                <List
                  // this has to be in a style because of how the component works
                  style={{ outline: 'none' }}
                  {...props}
                  height={loading ? 0 : height}
                  width={width}
                  rowCount={data.length}
                  rowHeight={cache.rowHeight}
                  rowRenderer={rowRenderer}
                  overscanRowCount={5}
                  deferredMeasurementCache={cache}
                />
              )}
            </AutoSizer>
          )}
        </TBody>
      </Table>
    </div>
  )
}

export default DataTable
