import { useMutation, useLazyQuery, gql } from '@apollo/client'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import EditIcon from '@mui/icons-material/Edit'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import BugReportIcon from '@mui/icons-material/BugReport'
import EmptyIcon from '@mui/icons-material/Remove'
import RefillIcon from '@mui/icons-material/Add'
import Visibility from '@mui/icons-material/Visibility'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import React, { memo, useState } from 'react'
import { useLocation } from 'wouter'
import { ConfirmDialog } from '../ConfirmDialog'

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

const MachineActions = memo(
  ({ machine, onActionSuccess, anchorEl, open, onClose, showViewAction }) => {
    const [, navigate] = useLocation()
    const [action, setAction] = useState({ command: null })
    const [showModal, setShowModal] = useState(false)
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)

    const warningMessage = (
      <span className="text-tomato">
        A user may be in the middle of a transaction and they could lose their
        funds if you continue.
      </span>
    )

    const [fetchMachineEvents, { loading: loadingEvents }] =
      useLazyQuery(MACHINE)

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
      fetchMachineEvents({
        variables: { deviceId: machine.deviceId },
        onCompleted: machineEventsLazy => {
          const message = !isStaticState(getState(machineEventsLazy))
            ? warningMessage
            : null
          setAction({ ...actionToDo, message })
        },
      })
    }

    const handleMenuItemClick = actionFn => {
      actionFn()
      onClose()
    }

    return (
      <>
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
          {showViewAction && (
            <MenuItem
              disabled={loading}
              onClick={() => {
                navigate(`/machines/${machine.deviceId}`)
                onClose()
              }}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>
          )}
          {showViewAction && <Divider />}

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() =>
                setAction({
                  command: 'rename',
                  display: 'Rename',
                  confirmationMessage: 'Write the new name for this machine',
                }),
              )
            }>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() =>
                setAction({
                  command: 'unpair',
                  display: 'Unpair',
                }),
              )
            }>
            <ListItemIcon>
              <LinkOffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Unpair</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() =>
                setAction({
                  command: 'reboot',
                  display: 'Reboot',
                }),
              )
            }>
            <ListItemIcon>
              <RestartAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reboot</ListItemText>
          </MenuItem>

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() =>
                setAction({
                  command: 'shutdown',
                  display: 'Shutdown',
                  message:
                    'In order to bring it back online, the machine will need to be visited and its power reset.',
                }),
              )
            }>
            <ListItemIcon>
              <PowerSettingsNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Shutdown</ListItemText>
          </MenuItem>

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() => {
                machineStatusPreflight({
                  command: 'restartServices',
                  display: 'Restart services for',
                })
              })
            }>
            <ListItemIcon>
              <RestartAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Restart services</ListItemText>
          </MenuItem>

          {machine.model === 'aveiro' && [
            <Divider key="divider" />,
            <MenuItem
              key="empty"
              disabled={loading}
              onClick={() =>
                handleMenuItemClick(() => {
                  setAction({
                    command: 'emptyUnit',
                    display: 'Empty',
                    message:
                      "Triggering this action will move all cash inside the machine towards its cashbox (if possible), allowing for the collection of cash from the machine via only its cashbox. Depending on how full the cash units are, it's possible that this action will need to be used more than once to ensure that the unit is left completely empty.",
                  })
                })
              }>
              <ListItemIcon>
                <EmptyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Empty Unit</ListItemText>
            </MenuItem>,
            <MenuItem
              key="refill"
              disabled={loading}
              onClick={() =>
                handleMenuItemClick(() => {
                  setAction({
                    command: 'refillUnit',
                    display: 'Refill',
                    message:
                      'Triggering this action will refill the recyclers in this machine, by using bills present in its cassettes. This action may require manual operation of the cassettes and close attention to make sure that the denominations in the cassettes match the denominations in the recyclers.',
                  })
                })
              }>
              <ListItemIcon>
                <RefillIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Refill Unit</ListItemText>
            </MenuItem>,
          ]}

          <Divider />

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() => {
                setShowModal(true)
              })
            }>
            <ListItemIcon>
              <BugReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Diagnostics</ListItemText>
          </MenuItem>

          <MenuItem
            disabled={loading}
            onClick={() =>
              handleMenuItemClick(() => {
                setShowGroupModal(true)
              })
            }>
            <ListItemIcon>
              <GroupAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Group</ListItemText>
          </MenuItem>
        </Menu>
        {showGroupModal && (
          <GroupModal
            deviceIds={[machine.deviceId]}
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
      </>
    )
  },
)

export default MachineActions
