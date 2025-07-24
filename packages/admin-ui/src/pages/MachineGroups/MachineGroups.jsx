import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import {
  MRT_ActionMenuItem,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import DeleteIcon from '@mui/icons-material/Delete'

import Title from '../../components/Title'
import { DeleteDialog } from '../../components/DeleteDialog'
import { Link } from '../../components/buttons'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts.js'
import CreateMachineGroupModal from './CreateMachineGroupModal'

const GET_MACHINE_GROUPS = gql`
  query getMachineGroups {
    machineGroups {
      id
      name
      complianceTriggerSetId
      deviceCount
    }
  }
`

const CREATE_MACHINE_GROUP = gql`
  mutation createMachineGroup($name: String!) {
    createMachineGroup(name: $name) {
      id
      name
      deviceCount
    }
  }
`

const DELETE_MACHINE_GROUP = gql`
  mutation deleteMachineGroup($id: ID!) {
    deleteMachineGroup(id: $id) {
      id
    }
  }
`

const MachineGroups = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const { data, loading } = useQuery(GET_MACHINE_GROUPS)

  const [createMachineGroup, { error: createError, reset: resetCreateError }] =
    useMutation(CREATE_MACHINE_GROUP, {
      refetchQueries: ['getMachineGroups'],
      onCompleted: () => {
        setCreateModalOpen(false)
      },
    })

  const [deleteMachineGroup] = useMutation(DELETE_MACHINE_GROUP, {
    refetchQueries: ['getMachineGroups'],
    onError: ({ graphQLErrors }) => {
      const errorCode = graphQLErrors?.[0]?.extensions?.code
      const extensions = graphQLErrors?.[0]?.extensions

      switch (errorCode) {
        case 'RESOURCE_HAS_DEPENDENCIES':
          if (extensions?.name === 'default') {
            setErrorMsg('Cannot delete the default machine group')
          } else {
            setErrorMsg('Cannot delete. Group has devices assigned to it.')
          }
          break
        case 'RESOURCE_NOT_FOUND':
          setErrorMsg('Machine group not found')
          break
        default:
          setErrorMsg('Error while deleting machine group')
      }
    },
    onCompleted: () => {
      setDeleteDialogOpen(false)
    },
  })

  const machineGroups = data?.machineGroups || []

  const handleCreateGroup = values => {
    return createMachineGroup({
      variables: { name: values.name.trim() },
    })
  }

  const closeCreateModal = () => {
    resetCreateError()
    setCreateModalOpen(false)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        size: 200,
      },
      {
        header: 'Device Count',
        accessorKey: 'deviceCount',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || 0,
      },
      {
        header: 'Compliance Trigger Set',
        accessorKey: 'complianceTriggerSetId',
        size: 150,
        Cell: ({ cell }) => cell.getValue() || 'None',
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    columns,
    data: machineGroups,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        key="delete"
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => {
          setGroupToDelete(row.original)
          setDeleteDialogOpen(true)
          setErrorMsg('')
          closeMenu()
        }}
        disabled={
          row.original.name === 'default' || row.original.deviceCount > 0
        }
        title={
          row.original.name === 'default' ? 'Cannot delete default group' : ''
        }
        table={table}
      />,
    ],
    state: {
      isLoading: loading,
    },
  })

  return (
    <>
      <Title>Machine Groups</Title>

      {!loading && (
        <>
          <div className="flex justify-end mb-8 -mt-14">
            <Link
              color="primary"
              onClick={() => {
                resetCreateError()
                setCreateModalOpen(true)
              }}>
              Add new group
            </Link>
          </div>
          <MaterialReactTable table={table} />
        </>
      )}

      <CreateMachineGroupModal
        showModal={createModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateGroup}
        createError={createError}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onDismissed={() => {
          setDeleteDialogOpen(false)
          setErrorMsg('')
        }}
        onConfirmed={() => {
          setErrorMsg('')
          deleteMachineGroup({ variables: { id: groupToDelete.id } })
        }}
        errorMessage={errorMsg}
      />
    </>
  )
}

export default MachineGroups
