import MAutocomplete from '@mui/material/Autocomplete'
import classnames from 'classnames'
import sort from 'match-sorter'
import * as R from 'ramda'
import React from 'react'
import { HoverableTooltip } from '../../Tooltip'
import { P } from '../../typography'

import TextInput from './TextInput'

const Autocomplete = ({
  limit,
  options,
  label,
  valueProp,
  multiple,
  onChange,
  labelProp,
  value: outsideValue,
  error,
  fullWidth,
  textAlign,
  size,
  autoFocus,
  ...props
}) => {
  const mapFromValue = options => it => R.find(R.propEq(valueProp, it))(options)
  const mapToValue = R.prop(valueProp)

  const getValue = () => {
    if (!valueProp) return outsideValue

    const transform = multiple
      ? R.map(mapFromValue(options))
      : mapFromValue(options)

    return transform(outsideValue)
  }

  const value = getValue()

  const innerOnChange = (evt, value) => {
    if (!valueProp) return onChange(evt, value)

    const rValue = multiple ? R.map(mapToValue)(value) : mapToValue(value)
    onChange(evt, rValue)
  }

  const valueArray = () => {
    if (R.isNil(value)) return []
    return multiple ? value : [value]
  }

  const filter = (array, input) => {
    if (!input) return array
    return sort(array, input, { keys: [valueProp, labelProp] })
  }

  const filterOptions = (array, { inputValue }) =>
    R.union(
      R.isEmpty(inputValue) ? valueArray() : [],
      filter(array, inputValue),
    ).slice(
      0,
      R.defaultTo(undefined)(limit) &&
        Math.max(limit, R.isEmpty(inputValue) ? valueArray().length : 0),
    )

  return (
    <MAutocomplete
      options={options}
      multiple={multiple}
      value={value}
      onChange={innerOnChange}
      getOptionLabel={R.path([labelProp])}
      forcePopupIcon={false}
      filterOptions={filterOptions}
      openOnFocus
      autoHighlight
      disableClearable
      clearOnEscape
      isOptionEqualToValue={R.eqProps(valueProp)}
      {...props}
      renderInput={params => {
        return (
          <TextInput
            {...params}
            autoFocus={autoFocus}
            label={label}
            value={outsideValue}
            error={error}
            size={size}
            fullWidth={fullWidth}
            textAlign={textAlign}
          />
        )
      }}
      renderOption={(iprops, props) => {
        if (!props.warning && !props.warningMessage)
          return <li {...iprops}>{R.path([labelProp])(props)}</li>

        const className = {
          'flex w-4 h-4 rounded-md': true,
          'bg-spring4': props.warning === 'clean',
          'bg-orange-yellow': props.warning === 'partial',
          'bg-tomato': props.warning === 'important',
        }

        const hoverableElement = <div className={classnames(className)} />

        return (
          <li {...iprops}>
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex">{R.path([labelProp])(props)}</div>
              <HoverableTooltip parentElements={hoverableElement} width={250}>
                <P>{props.warningMessage}</P>
              </HoverableTooltip>
            </div>
          </li>
        )
      }}
      slotProps={{
        chip: { onDelete: null },
      }}
    />
  )
}

export default Autocomplete
