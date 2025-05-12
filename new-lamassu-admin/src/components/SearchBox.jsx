import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import MAutocomplete from '@mui/material/Autocomplete'
import classnames from 'classnames'
import React, { memo, useState } from 'react'
import { P } from 'src/components/typography'
import SearchIcon from 'src/styling/icons/circle buttons/search/zodiac.svg?react'

import styles from './SearchBox.styles'

const useStyles = makeStyles(styles)

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
    const classes = useStyles({ size })

    const [popupOpen, setPopupOpen] = useState(false)

    const inputClasses = {
      [classes.input]: true,
      [classes.inputWithPopup]: popupOpen
    }

    const innerOnChange = filters => onChange(filters)

    return (
      <MAutocomplete
        loading={loading}
        classes={{ option: classes.autocomplete }}
        value={filters}
        options={options}
        getOptionLabel={it => it.label || it.value}
        renderOption={(props, it) => (
          <li {...props}>
            <div className={classes.item}>
              <P className={classes.itemLabel}>{it.label || it.value}</P>
              <P className={classes.itemType}>{it.type}</P>
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
          <Paper elevation={0} className={classes.popup}>
            <div className={classes.separator} />
            {children}
          </Paper>
        )}
        renderInput={params => {
          return (
            <InputBase
              ref={params.InputProps.ref}
              {...params}
              className={classnames(inputClasses)}
              startAdornment={<SearchIcon className={classes.iconButton} />}
              placeholder={inputPlaceholder}
              inputProps={{
                className: classes.bold,
                classes: {
                  root: classes.size
                },
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
