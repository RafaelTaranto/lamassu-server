import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import MAutocomplete from '@mui/material/Autocomplete'
import classnames from 'classnames'
import React, { memo, useState } from 'react'
import { P } from 'src/components/typography'
import SearchIcon from 'src/styling/icons/circle buttons/search/zodiac.svg?react'

const SearchBox = memo(
  ({
    loading = false,
    filters = [],
    options = [],
    inputPlaceholder = '',
    size,
    onChange,
    ...props
  }) => {
    const [popupOpen, setPopupOpen] = useState(false)

    const inputClasses = {
      'flex flex-1 h-8 px-2 py-2 font-md items-center rounded-2xl bg-zircon text-comet': true,
      'rounded-b-none': popupOpen
    }

    const innerOnChange = filters => onChange(filters)

    return (
      <MAutocomplete
        loading={loading}
        value={filters}
        options={options}
        getOptionLabel={it => it.label || it.value}
        renderOption={(props, it) => (
          <li {...props}>
            <div className="flex flex-row w-full h-8">
              <P className="m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {it.label || it.value}
              </P>
              <P className="m-0 ml-auto text-sm text-come">{it.type}</P>
            </div>
          </li>
        )}
        autoHighlight
        disableClearable
        clearOnEscape
        multiple
        filterSelectedOptions
        isOptionEqualToValue={(option, value) => option.type === value.type}
        PaperComponent={({ children }) => (
          <Paper
            elevation={0}
            className="flex flex-col rounded-b-xl bg-zircon shadow-2xl">
            <div className="w-[88%] h-[1px] my-p mx-auto border-1 border-comet" />
            {children}
          </Paper>
        )}
        renderInput={params => {
          return (
            <InputBase
              ref={params.InputProps.ref}
              {...params}
              className={classnames(inputClasses)}
              startAdornment={<SearchIcon className="mr-3" />}
              placeholder={inputPlaceholder}
              inputProps={{
                className: 'font-bold',
                ...params.inputProps
              }}
            />
          )
        }}
        onOpen={() => setPopupOpen(true)}
        onClose={() => setPopupOpen(false)}
        onChange={(_, filters) => innerOnChange(filters)}
        {...props}
      />
    )
  }
)

export default SearchBox
