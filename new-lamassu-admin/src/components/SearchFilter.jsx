import Chip from '@mui/material/Chip'
import React from 'react'
import { P, Label3 } from 'src/components/typography'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'
import FilterIcon from 'src/styling/icons/button/filter/white.svg?react'
import ReverseFilterIcon from 'src/styling/icons/button/filter/zodiac.svg?react'

import { ActionButton } from 'src/components/buttons'
import { onlyFirstToUpper, singularOrPlural } from 'src/utils/string'

const SearchFilter = ({
  filters,
  onFilterDelete,
  deleteAllFilters,
  entries = 0
}) => {
  return (
    <>
      <P className="mx-0">{'Filters:'}</P>
      <div className="flex mb-4">
        <div className="mt-auto">
          {filters.map((f, idx) => (
            <Chip
              key={idx}
              label={`${onlyFirstToUpper(f.type)}: ${f.label || f.value}`}
              onDelete={() => onFilterDelete(f)}
              deleteIcon={<CloseIcon className="w-2 h-2 mx-2" />}
            />
          ))}
        </div>
        <div className="flex ml-auto justify-end flex-row">
          {
            <Label3 className="text-comet m-auto mr-3">{`${entries} ${singularOrPlural(
              entries,
              `entry`,
              `entries`
            )}`}</Label3>
          }
          <ActionButton
            altTextColor
            color="secondary"
            Icon={ReverseFilterIcon}
            InverseIcon={FilterIcon}
            onClick={deleteAllFilters}>
            Delete filters
          </ActionButton>
        </div>
      </div>
    </>
  )
}

export default SearchFilter
