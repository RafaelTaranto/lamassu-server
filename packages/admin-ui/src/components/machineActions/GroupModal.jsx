import { useQuery, useMutation, gql } from '@apollo/client'
import React, { useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import Modal from '../Modal'
import { H3 } from '../typography'
import ErrorMessage from '../ErrorMessage'

import { Button } from '../buttons'

const MACHINE_GROUPS = gql`
  query getMachineGroups {
    machineGroups {
      id
      name
    }
  }
`

const CHANGE_GROUP = gql`
  mutation ChangeGroup($deviceIds: [ID!]!, $groupId: ID!) {
    assignMachinesToGroup(deviceIds: $deviceIds, groupId: $groupId)
  }
`

const GroupModal = ({ onClose, deviceIds, onSuccess }) => {
  const { data, loading } = useQuery(MACHINE_GROUPS)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [changeGroup, { loading: mutationLoading, error }] = useMutation(
    CHANGE_GROUP,
    {
      onCompleted: () => {
        onSuccess && onSuccess()
        onClose()
      },
      refetchQueries: ['getMachines', 'getMachineGroups'],
    },
  )

  const handleSubmit = () => {
    if (selectedGroup) {
      changeGroup({
        variables: {
          deviceIds: deviceIds,
          groupId: selectedGroup.id,
        },
      })
    }
  }

  const messageClass = 'm-auto flex flex-col items-center justify-center'

  return (
    <Modal
      title="Move Machine to Group"
      closeOnBackdropClick={true}
      width={450}
      height={300}
      handleClose={onClose}
      open={true}>
      {loading && (
        <div className={messageClass}>
          <H3>Loading...</H3>
        </div>
      )}

      {!loading && data && (
        <div className="flex flex-col h-full py-4">
          <div>
            <Autocomplete
              options={data.machineGroups || []}
              value={selectedGroup}
              onChange={(event, newValue) => {
                setSelectedGroup(newValue)
              }}
              getOptionLabel={option => option.name || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select Machine Group"
                  size="small"
                  fullWidth
                />
              )}
              fullWidth
            />
          </div>
          <div className="flex mt-auto mb-4">
            {error && (
              <ErrorMessage>
                {error.graphQLErrors?.[0]?.extensions?.code ===
                'GROUP_NOT_FOUND'
                  ? 'The selected group no longer exists'
                  : 'Failed to move machine to group'}
              </ErrorMessage>
            )}
            <Button
              disabled={!selectedGroup || mutationLoading}
              onClick={handleSubmit}
              className="ml-auto">
              {mutationLoading ? 'Moving...' : 'Move to Group'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default GroupModal
