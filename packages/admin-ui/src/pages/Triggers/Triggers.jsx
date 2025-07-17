import { useQuery, useMutation, gql } from '@apollo/client'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import * as R from 'ramda'
import React, { useMemo, useState } from 'react'
import {
  MRT_ActionMenuItem,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'
import { useLocation, useParams } from 'wouter'

import Modal from '../../components/Modal'
import { DeleteDialog } from '../../components/DeleteDialog'
import { Label1, Label2, P } from '../../components/typography'
import Title from '../../components/Title'
import FormRenderer from '../Services/FormRenderer'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts.js'
import { Link, SupportLinkButton } from '../../components/buttons'
import twilioSchema from '../Services/schemas/twilio'
import { fromNamespace, namespaces } from '../../utils/config'

import Wizard from './Wizard'
import { getElements } from './helper'

const SAVE_ACCOUNT = gql`
  mutation Save($accounts: JSONObject) {
    saveAccounts(accounts: $accounts)
  }
`

const GET_CONFIG = gql`
  query getData($complianceTriggerSetId: ID!) {
    config
    accounts
    accountsConfig {
      code
      display
      class
      cryptos
    }

    complianceTriggerSetById(id: $complianceTriggerSetId) {
      name
    }

    complianceTriggers(complianceTriggerSetId: $complianceTriggerSetId) {
      id
      direction
      triggerType
      requirementType

      suspensionDays
      threshold
      thresholdDays
      customInfoRequestId
      externalService
    }

    customInfoRequests {
      id
      customRequest
      enabled
    }
  }
`

const CREATE_TRIGGER = gql`
  mutation createTrigger(
    $complianceTriggerSetId: ID!
    $trigger: ComplianceTriggerInput!
  ) {
    createComplianceTrigger(
      complianceTriggerSetId: $complianceTriggerSetId
      trigger: $trigger
    )
  }
`

const DELETE_TRIGGER = gql`
  mutation deleteComplianceTrigger($trigger: ID!) {
    deleteComplianceTrigger(id: $trigger)
  }
`

const TriggerTable = ({
  triggers,
  loading,
  currency,
  customInfoRequests,
  onDeleteClick,
}) => {
  const columns = useMemo(
    () => getElements(currency, customInfoRequests),
    [currency, customInfoRequests],
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    columns,
    data: triggers,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row, table }) => [
      <MRT_ActionMenuItem
        key="delete"
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => onDeleteClick(row)}
        table={table}
      />,
    ],
    state: {
      isLoading: loading,
    },
  })

  return <MaterialReactTable table={table} />
}

const Triggers = () => {
  const { complianceTriggerSetId } = useParams()
  const [, navigate] = useLocation()

  const [triggerToDelete, setTriggerToDelete] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [wizardType, setWizard] = useState(null)

  const { data, loading } = useQuery(GET_CONFIG, {
    notifyOnNetworkStatusChange: true,
    variables: { complianceTriggerSetId },
  })

  const [createTrigger, { error: saveError }] = useMutation(CREATE_TRIGGER, {
    refetchQueries: () => ['getData'],
  })

  const [deleteComplianceTrigger, { error: deleteError }] = useMutation(
    DELETE_TRIGGER,
    {
      refetchQueries() {
        return ['getData']
      },
      onCompleted() {
        setTriggerToDelete(null)
        setDeleteDialogOpen(false)
        setWizard(null)
      },
    },
  )

  const error = saveError ?? deleteError ?? null

  const [twilioSetupPopup, setTwilioSetupPopup] = useState(false)

  const customInfoRequests = (data?.customInfoRequests ?? []).filter(
    cir => cir?.enabled,
  )

  const config = data?.config ?? {}
  const currency = fromNamespace(namespaces.LOCALE)(config)?.fiatCurrency
  const emailAuth = config?.triggersConfig_customerAuthentication === 'EMAIL'

  const complianceServices = R.filter(R.propEq('compliance', 'class'))(
    data?.accountsConfig || [],
  )
  const triggers = data?.complianceTriggers ?? []

  const [saveAccount] = useMutation(SAVE_ACCOUNT, {
    onCompleted: () => {
      setTwilioSetupPopup(false)
      toggleWizard('newTrigger')()
    },
    refetchQueries: () => ['getData'],
  })

  const setBlur = shouldBlur => {
    return shouldBlur
      ? document.querySelector('#root').classList.add('root-blur')
      : document.querySelector('#root').classList.remove('root-blur')
  }

  const toggleWizard = wizardName => forceDisable => {
    if (wizardType === wizardName || forceDisable) {
      setBlur(false)
      return setWizard(null)
    }
    setBlur(true)
    return setWizard(wizardName)
  }

  const twilioSave = twilio =>
    saveAccount({ variables: { accounts: { twilio } } })

  const openNewTriggerWizard = () => {
    if (!R.has('twilio', data?.accounts || {})) setTwilioSetupPopup(true)
    else toggleWizard('newTrigger')()
  }

  const saveNewTrigger = newTrigger => {
    const trigger = Object.assign(
      {
        id: uuidv4(),
        direction: 'both',
        triggerType: newTrigger.triggerType,
      },
      newTrigger.threshold,
      newTrigger.requirement,
    )
    toggleWizard('newTrigger')()
    return createTrigger({
      variables: { complianceTriggerSetId, trigger },
    })
  }

  const deleteTrigger = () =>
    deleteComplianceTrigger({
      variables: { trigger: triggerToDelete.id },
    })

  return (
    <>
      {!loading && (
        <Breadcrumbs
          className="my-5"
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb">
          <Label1
            noMargin
            className="cursor-pointer text-comet"
            onClick={() => navigate('/compliance/triggers')}>
            Trigger sets
          </Label1>
          <Label2 noMargin className="cursor-pointer text-comet">
            {data?.complianceTriggerSetById?.name}
          </Label2>
        </Breadcrumbs>
      )}
      <Title>Compliance Triggers</Title>
      {!loading && (
        <div className="flex justify-end">
          <Link color="primary" onClick={openNewTriggerWizard}>
            + Add new trigger
          </Link>
        </div>
      )}
      <TriggerTable
        triggers={triggers}
        loading={loading}
        currency={currency}
        customInfoRequests={customInfoRequests}
        onDeleteClick={row => {
          setTriggerToDelete(row.original)
          setDeleteDialogOpen(true)
        }}
      />
      {!loading && wizardType === 'newTrigger' && (
        <Wizard
          currency={currency}
          error={error?.message}
          save={saveNewTrigger}
          onClose={() => {
            toggleWizard('newTrigger')()
          }}
          customInfoRequests={customInfoRequests}
          complianceServices={complianceServices}
          emailAuth={emailAuth}
        />
      )}
      {twilioSetupPopup && (
        <Modal
          title={`Configure SMS`}
          width={478}
          handleClose={() => setTwilioSetupPopup(false)}
          open={true}>
          <P>
            In order for compliance triggers to work, you'll first need to
            configure Twilio.
          </P>
          <SupportLinkButton
            link="https://support.lamassu.is/hc/en-us/articles/115001203951-Twilio-for-SMS"
            label="Lamassu Support Article"
          />
          <FormRenderer
            save={twilioSave}
            elements={twilioSchema.elements}
            validationSchema={twilioSchema.getValidationSchema}
          />
        </Modal>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onDismissed={() => setDeleteDialogOpen(false)}
        onConfirmed={deleteTrigger}
        errorMessage={error?.message}
      />
    </>
  )
}

export default Triggers
