import { useQuery, useMutation, gql } from '@apollo/client'
import React, { useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import Modal from '../../components/Modal'
import { H3 } from '../../components/typography'
import ErrorMessage from '../../components/ErrorMessage'
import { Button } from '../../components/buttons'

const COMPLIANCE_TRIGGER_SETS = gql`
  query getComplianceTriggerSets {
    complianceTriggerSets {
      id
      name
    }
  }
`

const CHANGE_COMPLIANCE_TRIGGER_SET = gql`
  mutation ChangeComplianceTriggerSet(
    $machineGroupId: ID!
    $complianceTriggerSetId: ID
  ) {
    assignComplianceTriggerSetToMachineGroup(
      id: $machineGroupId
      complianceTriggerSetId: $complianceTriggerSetId
    ) {
      id
    }
  }
`

const ComplianceTriggerSetModal = ({ onClose, machineGroupId, onSuccess }) => {
  const { data, loading } = useQuery(COMPLIANCE_TRIGGER_SETS)
  const complianceTriggerSets = [{ id: null, name: 'None' }].concat(
    data?.complianceTriggerSets ?? [],
  )

  const [changeComplianceTriggerSet, { loading: mutationLoading, error }] =
    useMutation(CHANGE_COMPLIANCE_TRIGGER_SET, {
      onCompleted: () => {
        onSuccess()
        onClose()
      },
    })

  const [selectedComplianceTriggerSet, setSelectedComplianceTriggerSet] =
    useState(null)
  const handleSubmit = () => {
    if (selectedComplianceTriggerSet) {
      changeComplianceTriggerSet({
        variables: {
          machineGroupId,
          complianceTriggerSetId: selectedComplianceTriggerSet.id,
        },
      })
    }
  }

  const messageClass = 'm-auto flex flex-col items-center justify-center'

  return (
    <Modal
      title="Assign Compliance Trigger Set to Machine Group"
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
              options={complianceTriggerSets}
              value={selectedComplianceTriggerSet}
              onChange={(event, newValue) => {
                setSelectedComplianceTriggerSet(newValue)
              }}
              getOptionLabel={option => option.name || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select Compliance Trigger Set"
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
                'RESOURCE_NOT_FOUND'
                  ? 'The selected compliance trigger set no longer exists'
                  : 'Failed to assign compliance trigger set to machine group'}
              </ErrorMessage>
            )}
            <Button
              disabled={!selectedComplianceTriggerSet || mutationLoading}
              onClick={handleSubmit}
              className="ml-auto">
              {mutationLoading
                ? 'Assigning...'
                : 'Assign Compliance Trigger Set'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ComplianceTriggerSetModal
