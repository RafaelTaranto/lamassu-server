import { useMutation, useLazyQuery, gql } from '@apollo/client'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import React, { memo, useState } from 'react'
import { ConfirmDialog } from '../ConfirmDialog'
import ActionButton from '../buttons/ActionButton'
import { H3 } from '../typography'
import EditReversedIcon from '../../styling/icons/button/edit/white.svg?react'
import EditIcon from '../../styling/icons/button/edit/zodiac.svg?react'
import RebootReversedIcon from '../../styling/icons/button/reboot/white.svg?react'
import RebootIcon from '../../styling/icons/button/reboot/zodiac.svg?react'
import ShutdownReversedIcon from '../../styling/icons/button/shut down/white.svg?react'
import ShutdownIcon from '../../styling/icons/button/shut down/zodiac.svg?react'
import UnpairReversedIcon from '../../styling/icons/button/unpair/white.svg?react'
import UnpairIcon from '../../styling/icons/button/unpair/zodiac.svg?react'

import DiagnosticsModal from './DiagnosticsModal'
import GroupModal from './GroupModal'

const MACHINE_ACTION = gql`
  mutation MachineAction(
    $deviceId: ID!
    $action: MachineAction!
    $newName: String
  ) {
    machineAction(deviceId: $deviceId, action: $action, newName: $newName) {
      deviceId
    }
  }
`

const MACHINE = gql`
  query getMachine($deviceId: ID!) {
    machine(deviceId: $deviceId) {
      latestEvent {
        note
      }
    }
  }
`

const isStaticState = machineState => {
  if (!machineState) {
    return true
  }
  const staticStates = [
    'chooseCoin',
    'idle',
    'pendingIdle',
    'dualIdle',
    'networkDown',
    'unpaired',
    'maintenance',
    'virgin',
    'wifiList',
  ]
  return staticStates.includes(machineState)
}

const getState = machineEventsLazy =>
  JSON.parse(machineEventsLazy.machine.latestEvent?.note ?? '{"state": null}')
    .state

const MachineActions = memo(({ machine, onActionSuccess }) => {
  const [action, setAction] = useState({ command: null })
  const [preflightOptions, setPreflightOptions] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const warningMessage = (
    <span className="text-tomato">
      A user may be in the middle of a transaction and they could lose their
      funds if you continue.
    </span>
  )

  const [fetchMachineEvents, { loading: loadingEvents }] = useLazyQuery(
    MACHINE,
    preflightOptions,
  )

  const [simpleMachineAction] = useMutation(MACHINE_ACTION)

  const [machineAction, { loading }] = useMutation(MACHINE_ACTION, {
    onError: ({ message }) => {
      const errorMessage = message ?? 'An error ocurred'
      setErrorMessage(errorMessage)
    },
    onCompleted: () => {
      onActionSuccess && onActionSuccess()
      setAction({ display: action.display, command: null })
    },
  })

  const confirmDialogOpen = Boolean(action.command)
  const disabled = !!(action?.command === 'restartServices' && loadingEvents)

  const machineStatusPreflight = actionToDo => {
    setPreflightOptions({
      variables: { deviceId: machine.deviceId },
      onCompleted: machineEventsLazy => {
        const message = !isStaticState(getState(machineEventsLazy))
          ? warningMessage
          : null
        setAction({ ...actionToDo, message })
      },
    })
    fetchMachineEvents()
  }

  return (
    <div>
      <H3>Actions</H3>
      <div className="flex flex-row flex-wrap justify-start gap-2">
        <ActionButton
          color="primary"
          Icon={EditIcon}
          InverseIcon={EditReversedIcon}
          disabled={loading}
          onClick={() =>
            setAction({
              command: 'rename',
              display: 'Rename',
              confirmationMessage: 'Write the new name for this machine',
            })
          }>
          Rename
        </ActionButton>
        <ActionButton
          color="primary"
          Icon={UnpairIcon}
          InverseIcon={UnpairReversedIcon}
          disabled={loading}
          onClick={() =>
            setAction({
              command: 'unpair',
              display: 'Unpair',
            })
          }>
          Unpair
        </ActionButton>
        <ActionButton
          color="primary"
          Icon={RebootIcon}
          InverseIcon={RebootReversedIcon}
          disabled={loading}
          onClick={() =>
            setAction({
              command: 'reboot',
              display: 'Reboot',
            })
          }>
          Reboot
        </ActionButton>
        <ActionButton
          color="primary"
          Icon={ShutdownIcon}
          InverseIcon={ShutdownReversedIcon}
          disabled={loading}
          onClick={() =>
            setAction({
              command: 'shutdown',
              display: 'Shutdown',
              message:
                'In order to bring it back online, the machine will need to be visited and its power reset.',
            })
          }>
          Shutdown
        </ActionButton>
        <ActionButton
          color="primary"
          Icon={RebootIcon}
          InverseIcon={RebootReversedIcon}
          disabled={loading}
          onClick={() => {
            machineStatusPreflight({
              command: 'restartServices',
              display: 'Restart services for',
            })
          }}>
          Restart services
        </ActionButton>
        {machine.model === 'aveiro' && (
          <ActionButton
            color="primary"
            Icon={RebootIcon}
            InverseIcon={RebootReversedIcon}
            disabled={loading}
            onClick={() => {
              setAction({
                command: 'emptyUnit',
                display: 'Empty',
                message:
                  "Triggering this action will move all cash inside the machine towards its cashbox (if possible), allowing for the collection of cash from the machine via only its cashbox. Depending on how full the cash units are, it's possible that this action will need to be used more than once to ensure that the unit is left completely empty.",
              })
            }}>
            Empty Unit
          </ActionButton>
        )}
        {machine.model === 'aveiro' && (
          <ActionButton
            color="primary"
            Icon={RebootIcon}
            InverseIcon={RebootReversedIcon}
            disabled={loading}
            onClick={() => {
              setAction({
                command: 'refillUnit',
                display: 'Refill',
                message:
                  'Triggering this action will refill the recyclers in this machine, by using bills present in its cassettes. This action may require manual operation of the cassettes and close attention to make sure that the denominations in the cassettes match the denominations in the recyclers.',
              })
            }}>
            Refill Unit
          </ActionButton>
        )}
        <ActionButton
          color="primary"
          Icon={RebootIcon}
          InverseIcon={RebootReversedIcon}
          disabled={loading}
          onClick={() => {
            setShowModal(true)
          }}>
          Diagnostics
        </ActionButton>
        <ActionButton
          color="primary"
          Icon={GroupAddIcon}
          InverseIcon={GroupAddOutlinedIcon}
          disabled={loading}
          onClick={() => {
            setShowGroupModal(true)
          }}>
          Move to another group
        </ActionButton>
      </div>
      {showGroupModal && (
        <GroupModal
          deviceId={machine.deviceId}
          onClose={() => {
            setShowGroupModal(false)
          }}
          onSuccess={onActionSuccess}
        />
      )}
      {showModal && (
        <DiagnosticsModal
          sendAction={() =>
            simpleMachineAction({
              variables: {
                deviceId: machine.deviceId,
                action: 'diagnostics',
              },
            })
          }
          deviceId={machine.deviceId}
          onClose={() => {
            setShowModal(false)
          }}
        />
      )}
      <ConfirmDialog
        disabled={disabled}
        open={confirmDialogOpen}
        title={`${action.display} this machine?`}
        errorMessage={errorMessage}
        toBeConfirmed={machine.name}
        message={action?.message}
        confirmationMessage={action?.confirmationMessage}
        saveButtonAlwaysEnabled={action?.command === 'rename'}
        onConfirmed={value => {
          setErrorMessage(null)
          machineAction({
            variables: {
              deviceId: machine.deviceId,
              action: `${action?.command}`,
              ...(action?.command === 'rename' && { newName: value }),
            },
          })
        }}
        onDismissed={() => {
          setAction({ display: action.display, command: null })
          setErrorMessage(null)
        }}
      />
    </div>
  )
})

export default MachineActions
