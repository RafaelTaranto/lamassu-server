import * as R from 'ramda'
import React, { useState } from 'react'
import { DeleteDialog } from 'src/components/DeleteDialog'
import DataTable from 'src/components/tables/DataTable'
import CopyToClipboard from 'src/components/CopyToClipboard.jsx'
import DeleteIcon from 'src/styling/icons/action/delete/enabled.svg?react'

import { IconButton } from 'src/components/buttons'

const BlacklistTable = ({
  data,
  handleDeleteEntry,
  errorMessage,
  setErrorMessage,
  deleteDialog,
  setDeleteDialog
}) => {
  const [toBeDeleted, setToBeDeleted] = useState()

  const elements = [
    {
      name: 'address',
      header: 'Address',
      width: 1070,
      textAlign: 'left',
      size: 'sm',
      view: it => (
        <div className="ml-2">
          <CopyToClipboard>{R.path(['address'], it)}</CopyToClipboard>
        </div>
      )
    },
    {
      name: 'deleteButton',
      header: 'Delete',
      width: 130,
      textAlign: 'center',
      size: 'sm',
      view: it => (
        <IconButton
          className="pl-3"
          onClick={() => {
            setDeleteDialog(true)
            setToBeDeleted(it)
          }}
          size="large">
          <DeleteIcon />
        </IconButton>
      )
    }
  ]

  return (
    <>
      <DataTable
        data={data}
        elements={elements}
        emptyText="No blacklisted addresses so far"
        name="blacklistTable"
      />
      <DeleteDialog
        open={deleteDialog}
        onDismissed={() => {
          setDeleteDialog(false)
          setErrorMessage(null)
        }}
        onConfirmed={() => {
          setErrorMessage(null)
          handleDeleteEntry(R.path(['address'], toBeDeleted))
        }}
        errorMessage={errorMessage}
      />
    </>
  )
}

export default BlacklistTable
