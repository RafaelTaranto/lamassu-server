import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import React from 'react'
import { Table, THead, TBody, Td, Th, Tr } from '../fake-table/Table'
import EditIcon from '../../styling/icons/action/edit/white.svg?react'

import { Label1, P } from '../typography/index.jsx'

const SingleRowTable = ({
  width = 378,
  height = 128,
  title,
  items,
  onEdit,
  className,
}) => {
  return (
    <>
      <Table className={className} style={{ width }}>
        <THead>
          <Th className="flex flex-1 justify-between items-center pr-3">
            {title}
            <IconButton onClick={onEdit} className="mb-[1px]">
              <SvgIcon>
                <EditIcon />
              </SvgIcon>
            </IconButton>
          </Th>
        </THead>
        <TBody>
          <Tr className="m-0" style={{ height }}>
            <Td width={width}>
              {items && (
                <>
                  {items[0] && (
                    <div className="flex flex-col mt-4 min-h-9">
                      <Label1 noMargin className="color-comet mb-1">
                        {items[0].label}
                      </Label1>
                      <P
                        noMargin
                        className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {items[0].value}
                      </P>
                    </div>
                  )}
                  {items[1] && (
                    <div className="flex flex-col mt-4 min-h-9">
                      <Label1 noMargin className="color-comet mb-1">
                        {items[1].label}
                      </Label1>
                      <P
                        noMargin
                        className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {items[1].value}
                      </P>
                    </div>
                  )}
                </>
              )}
            </Td>
          </Tr>
        </TBody>
      </Table>
    </>
  )
}

export default SingleRowTable
