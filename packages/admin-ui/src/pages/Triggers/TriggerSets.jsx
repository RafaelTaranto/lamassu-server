import Visibility from '@mui/icons-material/Visibility'
import Switch from '@mui/material/Switch'
import React, { useMemo, useState } from 'react'
import * as R from 'ramda'
import { useLocation } from 'wouter'
import { useQuery, useMutation, gql } from '@apollo/client'
import classnames from 'classnames'
import {
  MRT_ActionMenuItem,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import DeleteIcon from '@mui/icons-material/Delete'

import { DeleteDialog } from '../../components/DeleteDialog'
import { HelpTooltip } from '../../components/Tooltip'
import TitleSection from '../../components/layout/TitleSection'
import { P, Label2 } from '../../components/typography'
import { Link, SupportLinkButton } from '../../components/buttons'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts.js'
import { fromNamespace, toNamespace } from '../../utils/config'
import TriggerSetsModal from './TriggerSetsModal'
import ReverseCustomInfoIcon from '../../styling/icons/circle buttons/filter/white.svg?react'
import CustomInfoIcon from '../../styling/icons/circle buttons/filter/zodiac.svg?react'
import ReverseSettingsIcon from '../../styling/icons/circle buttons/settings/white.svg?react'
import SettingsIcon from '../../styling/icons/circle buttons/settings/zodiac.svg?react'

import AdvancedTriggers from './components/AdvancedTriggers'
import CustomInfoRequests from './CustomInfoRequests'

const GET_CONFIG = gql`
  query getComplianceTriggerSets {
    configWithAllTriggers
    complianceTriggerSets {
      id
      name
    }
    customInfoRequests {
      id
      customRequest
      enabled
    }
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const CREATE_COMPLIANCE_TRIGGER_SET = gql`
  mutation createComplianceTriggerSet($name: String!) {
    createComplianceTriggerSet(name: $name) {
      id
      name
    }
  }
`

const DELETE_COMPLIANCE_TRIGGER_SET = gql`
  mutation deleteComplianceTriggerSet($id: ID!) {
    deleteComplianceTriggerSet(id: $id) {
      id
    }
  }
`

const TriggerSets = () => {
  const [, navigate] = useLocation()
  const [wizardType, setWizard] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [setToDelete, setTriggerSetToDelete] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionMenuClose, setActionMenuClose] = useState(null)
  const [subMenu, setSubMenu] = useState(false)

  const { data, loading, refetch } = useQuery(GET_CONFIG, {
    notifyOnNetworkStatusChange: true,
  })

  const [
    createComplianceTriggerSet,
    { error: createError, reset: resetCreateError },
  ] = useMutation(CREATE_COMPLIANCE_TRIGGER_SET, {
    refetchQueries: ['getComplianceTriggerSets'],
    onCompleted: () => {
      setCreateModalOpen(false)
    },
  })

  const [deleteComplianceTriggerSet] = useMutation(
    DELETE_COMPLIANCE_TRIGGER_SET,
    {
      refetchQueries: ['getComplianceTriggerSets'],
      onError: errorMsg => setErrorMsg(errorMsg),
      onCompleted: () => {
        setDeleteDialogOpen(false)
        // Close the action menu if it's open
        if (actionMenuClose) {
          actionMenuClose()
          setActionMenuClose(null)
        }
      },
    },
  )

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    onCompleted: () => setWizard(false),
    refetchQueries: () => ['getComplianceTriggerSets'],
    onError: errorMsg => setErrorMsg(errorMsg),
  })

  const rejectAddressReuse = (
    data?.configWithAllTriggers &&
    fromNamespace('compliance')(data.configWithAllTriggers)
  )?.rejectAddressReuse
  const enabledCustomInfoRequests = (data?.customInfoRequests ?? []).filter(
    cir => cir?.enabled,
  )

  const addressReuseSave = rawConfig => {
    const config = toNamespace('compliance')(rawConfig)
    return saveConfig({ variables: { config } })
  }

  const titleSectionWidth = {
    'w-230': !subMenu === 'customInfoRequests',
  }

  const setBlur = shouldBlur => {
    return shouldBlur
      ? document.querySelector('#root').classList.add('root-blur')
      : document.querySelector('#root').classList.remove('root-blur')
  }

  const complianceTriggerSets = data?.complianceTriggerSets || []

  const toggleWizard = wizardName => forceDisable => {
    if (wizardType === wizardName || forceDisable) {
      setBlur(false)
      return setWizard(null)
    }
    setBlur(true)
    return setWizard(wizardName)
  }

  const handleCreateTriggerSet = values => {
    return createComplianceTriggerSet({
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
    ],
    [],
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    columns,
    data: complianceTriggerSets,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => {
          navigate(`/compliance/triggers/${row.original.id}`)
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="delete"
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => {
          setTriggerSetToDelete(row.original)
          setDeleteDialogOpen(true)
          setErrorMsg('')
          setActionMenuClose(() => closeMenu)
        }}
        table={table}
      />,
    ],
    state: {
      isLoading: loading,
    },
  })

  return (
    <>
      <TitleSection
        title="Compliance Trigger Sets"
        buttons={[
          {
            text: 'Advanced settings',
            icon: SettingsIcon,
            inverseIcon: ReverseSettingsIcon,
            forceDisable: subMenu !== 'advancedSettings',
            toggle: show => {
              refetch()
              setSubMenu(show ? 'advancedSettings' : false)
            },
          },
          {
            text: 'Custom info requests',
            icon: CustomInfoIcon,
            inverseIcon: ReverseCustomInfoIcon,
            forceDisable: subMenu !== 'customInfoRequests',
            toggle: show => {
              refetch()
              setSubMenu(show ? 'customInfoRequests' : false)
            },
          },
        ]}
        className={classnames(titleSectionWidth)}>
        {!subMenu && (
          <div className="flex items-center">
            <div className="flex items-center justify-end -mr-1">
              <P>Reject reused addresses</P>
              <Switch
                checked={rejectAddressReuse}
                onChange={event => {
                  addressReuseSave({ rejectAddressReuse: event.target.checked })
                }}
                value={rejectAddressReuse}
              />
              <Label2 className="m-3 w-6">
                {rejectAddressReuse ? 'On' : 'Off'}
              </Label2>
              <HelpTooltip width={304}>
                <P>
                  For details about rejecting address reuse, please read the
                  relevant knowledgebase article:
                </P>
                <SupportLinkButton
                  link="https://support.lamassu.is/hc/en-us/articles/360033622211-Reject-Address-Reuse"
                  label="Reject Address Reuse"
                />
              </HelpTooltip>
            </div>
          </div>
        )}
        {subMenu === 'customInfoRequests' &&
          !R.isEmpty(enabledCustomInfoRequests) && (
            <div className="flex justify-end">
              <Link
                color="primary"
                onClick={() => toggleWizard('newCustomRequest')()}>
                + Add new custom info request
              </Link>
            </div>
          )}
      </TitleSection>

      {!loading && !subMenu && (
        <>
          <div className="flex justify-end">
            <Link
              color="primary"
              onClick={() => {
                resetCreateError()
                setCreateModalOpen(true)
              }}>
              Add new trigger set
            </Link>
          </div>
          <MaterialReactTable table={table} />
        </>
      )}

      {!loading && subMenu === 'customInfoRequests' && (
        <CustomInfoRequests
          data={enabledCustomInfoRequests}
          showWizard={wizardType === 'newCustomRequest'}
          toggleWizard={toggleWizard('newCustomRequest')}
          refetchQueries={['getComplianceTriggerSets']}
        />
      )}

      {!loading && subMenu === 'advancedSettings' && (
        <AdvancedTriggers
          error={errorMsg}
          save={saveConfig}
          data={data}></AdvancedTriggers>
      )}

      <TriggerSetsModal
        showModal={createModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateTriggerSet}
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
          deleteComplianceTriggerSet({ variables: { id: setToDelete.id } })
        }}
        errorMessage={errorMsg}
      />
    </>
  )
}

export default TriggerSets
