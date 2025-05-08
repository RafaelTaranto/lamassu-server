import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Dialog from '@mui/material/Dialog'
import Switch from '@mui/material/Switch'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import * as R from 'ramda'
import React, { memo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import ErrorMessage from 'src/components/ErrorMessage'
import { Label1, Label2, H2, Info3 } from 'src/components/typography'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'
import AuthorizeReversedIcon from 'src/styling/icons/button/authorize/white.svg?react'
import AuthorizeIcon from 'src/styling/icons/button/authorize/zodiac.svg?react'
import BlockReversedIcon from 'src/styling/icons/button/block/white.svg?react'
import BlockIcon from 'src/styling/icons/button/block/zodiac.svg?react'
import DataReversedIcon from 'src/styling/icons/button/data/white.svg?react'
import DataIcon from 'src/styling/icons/button/data/zodiac.svg?react'

import { Button, ActionButton } from 'src/components/buttons'
import {
  OVERRIDE_AUTHORIZED,
  OVERRIDE_REJECTED
} from 'src/pages/Customers/components/consts'
// TODO: Enable for next release
// import DiscountReversedIcon from 'src/styling/icons/button/discount/white.svg?react'
// import Discount from 'src/styling/icons/button/discount/zodiac.svg?react'
import { fromNamespace, namespaces } from 'src/utils/config'

import CustomerData from './CustomerData'
import CustomerNotes from './CustomerNotes'
import CustomerPhotos from './CustomerPhotos'
import {
  CustomerDetails,
  TransactionsList,
  CustomerSidebar,
  Wizard
} from './components'
import { getFormattedPhone, getName, formatPhotosData } from './helper'

const GET_CUSTOMER = gql`
  query customer($customerId: ID!) {
    config
    customer(customerId: $customerId) {
      id
      authorizedOverride
      frontCameraPath
      frontCameraAt
      frontCameraOverride
      phone
      email
      isAnonymous
      smsOverride
      idCardData
      idCardDataOverride
      idCardDataExpiration
      idCardPhotoPath
      idCardPhotoOverride
      idCardPhotoAt
      usSsn
      usSsnOverride
      sanctions
      sanctionsAt
      sanctionsOverride
      totalTxs
      totalSpent
      lastActive
      lastUsedMachineName
      lastTxFiat
      lastTxFiatCode
      lastTxClass
      daysSuspended
      isSuspended
      isTestCustomer
      subscriberInfo
      phoneOverride
      externalCompliance
      customFields {
        id
        label
        value
      }
      notes {
        id
        customerId
        title
        content
        created
        lastEditedAt
      }
      transactions {
        txClass
        id
        fiat
        fiatCode
        cryptoAtoms
        cryptoCode
        created
        machineName
        errorMessage: error
        error: errorCode
        txCustomerPhotoAt
        txCustomerPhotoPath
      }
      customInfoRequests {
        customerId
        override
        overrideBy
        overrideAt
        customerData
        customInfoRequest {
          id
          enabled
          customRequest
        }
      }
    }
  }
`

const SET_CUSTOMER = gql`
  mutation setCustomer($customerId: ID!, $customerInput: CustomerInput) {
    setCustomer(customerId: $customerId, customerInput: $customerInput) {
      id
      authorizedOverride
      frontCameraPath
      frontCameraOverride
      phone
      email
      smsOverride
      idCardData
      idCardDataOverride
      idCardDataExpiration
      idCardPhotoPath
      idCardPhotoOverride
      usSsn
      usSsnOverride
      sanctions
      sanctionsAt
      sanctionsOverride
      totalTxs
      totalSpent
      lastActive
      lastTxFiat
      lastTxFiatCode
      lastTxClass
      subscriberInfo
      phoneOverride
      externalCompliance
    }
  }
`
const EDIT_CUSTOMER = gql`
  mutation editCustomer($customerId: ID!, $customerEdit: CustomerEdit) {
    editCustomer(customerId: $customerId, customerEdit: $customerEdit) {
      id
      idCardData
      usSsn
    }
  }
`

const REPLACE_CUSTOMER_PHOTO = gql`
  mutation replacePhoto(
    $customerId: ID!
    $photoType: String
    $newPhoto: Upload
  ) {
    replacePhoto(
      customerId: $customerId
      photoType: $photoType
      newPhoto: $newPhoto
    ) {
      id
      newPhoto
      photoType
    }
  }
`

const DELETE_EDITED_CUSTOMER = gql`
  mutation deleteEditedData($customerId: ID!, $customerEdit: CustomerEdit) {
    deleteEditedData(customerId: $customerId, customerEdit: $customerEdit) {
      id
      frontCameraPath
      idCardData
      idCardPhotoPath
      usSsn
    }
  }
`

const SET_AUTHORIZED_REQUEST = gql`
  mutation setAuthorizedCustomRequest(
    $customerId: ID!
    $infoRequestId: ID!
    $override: String!
  ) {
    setAuthorizedCustomRequest(
      customerId: $customerId
      infoRequestId: $infoRequestId
      override: $override
    )
  }
`

const SET_CUSTOMER_CUSTOM_INFO_REQUEST = gql`
  mutation setCustomerCustomInfoRequest(
    $customerId: ID!
    $infoRequestId: ID!
    $data: JSON!
  ) {
    setCustomerCustomInfoRequest(
      customerId: $customerId
      infoRequestId: $infoRequestId
      data: $data
    )
  }
`

const CREATE_NOTE = gql`
  mutation createCustomerNote(
    $customerId: ID!
    $title: String!
    $content: String!
  ) {
    createCustomerNote(
      customerId: $customerId
      title: $title
      content: $content
    )
  }
`

const DELETE_NOTE = gql`
  mutation deleteCustomerNote($noteId: ID!) {
    deleteCustomerNote(noteId: $noteId)
  }
`

const EDIT_NOTE = gql`
  mutation editCustomerNote($noteId: ID!, $newContent: String!) {
    editCustomerNote(noteId: $noteId, newContent: $newContent)
  }
`

const ENABLE_TEST_CUSTOMER = gql`
  mutation enableTestCustomer($customerId: ID!) {
    enableTestCustomer(customerId: $customerId)
  }
`

const DISABLE_TEST_CUSTOMER = gql`
  mutation disableTestCustomer($customerId: ID!) {
    disableTestCustomer(customerId: $customerId)
  }
`

const GET_DATA = gql`
  query getData {
    config
  }
`

const SET_CUSTOM_ENTRY = gql`
  mutation addCustomField($customerId: ID!, $label: String!, $value: String!) {
    addCustomField(customerId: $customerId, label: $label, value: $value)
  }
`

const EDIT_CUSTOM_ENTRY = gql`
  mutation saveCustomField($customerId: ID!, $fieldId: ID!, $value: String!) {
    saveCustomField(customerId: $customerId, fieldId: $fieldId, value: $value)
  }
`

const GET_ACTIVE_CUSTOM_REQUESTS = gql`
  query customInfoRequests($onlyEnabled: Boolean) {
    customInfoRequests(onlyEnabled: $onlyEnabled) {
      id
      customRequest
    }
  }
`

const CHECK_AGAINST_SANCTIONS = gql`
  query checkAgainstSanctions($customerId: ID) {
    checkAgainstSanctions(customerId: $customerId) {
      ofacSanctioned
    }
  }
`

const CustomerProfile = memo(() => {
  const history = useHistory()

  const [retrieve, setRetrieve] = useState(false)
  const [showCompliance, setShowCompliance] = useState(false)
  const [wizard, setWizard] = useState(false)
  const [error, setError] = useState(null)
  const [clickedItem, setClickedItem] = useState('overview')
  const { id: customerId } = useParams()

  const {
    data: customerResponse,
    refetch: getCustomer,
    loading: customerLoading
  } = useQuery(GET_CUSTOMER, {
    variables: { customerId }
  })

  const { data: configResponse, loading: configLoading } = useQuery(GET_DATA)

  const { data: activeCustomRequests } = useQuery(GET_ACTIVE_CUSTOM_REQUESTS, {
    variables: {
      onlyEnabled: true
    }
  })

  const [setCustomEntry] = useMutation(SET_CUSTOM_ENTRY, {
    onCompleted: () => getCustomer()
  })

  const [editCustomEntry] = useMutation(EDIT_CUSTOM_ENTRY, {
    onCompleted: () => getCustomer()
  })

  const [replaceCustomerPhoto] = useMutation(REPLACE_CUSTOMER_PHOTO, {
    onCompleted: () => getCustomer()
  })

  const [editCustomerData] = useMutation(EDIT_CUSTOMER, {
    onCompleted: () => getCustomer()
  })

  const [deleteCustomerEditedData] = useMutation(DELETE_EDITED_CUSTOMER, {
    onCompleted: () => getCustomer()
  })

  const [setCustomer] = useMutation(SET_CUSTOMER, {
    onCompleted: () => {
      getCustomer()
      setRetrieve(false)
    },
    onError: error => setError(error)
  })

  const [authorizeCustomRequest] = useMutation(SET_AUTHORIZED_REQUEST, {
    onCompleted: () => getCustomer()
  })

  const [setCustomerCustomInfoRequest] = useMutation(
    SET_CUSTOMER_CUSTOM_INFO_REQUEST,
    {
      onCompleted: () => getCustomer()
    }
  )

  const [createNote] = useMutation(CREATE_NOTE, {
    onCompleted: () => getCustomer()
  })

  const [deleteNote] = useMutation(DELETE_NOTE, {
    onCompleted: () => getCustomer()
  })

  const [editNote] = useMutation(EDIT_NOTE, {
    onCompleted: () => getCustomer()
  })

  const saveCustomEntry = it => {
    setCustomEntry({
      variables: {
        customerId,
        label: it.title,
        value: it.data
      }
    })
    setWizard(null)
  }

  const updateCustomEntry = it => {
    editCustomEntry({
      variables: {
        customerId,
        fieldId: it.fieldId,
        value: it.value
      }
    })
  }

  const [enableTestCustomer] = useMutation(ENABLE_TEST_CUSTOMER, {
    variables: { customerId },
    onCompleted: () => getCustomer()
  })

  const [disableTestCustomer] = useMutation(DISABLE_TEST_CUSTOMER, {
    variables: { customerId },
    onCompleted: () => getCustomer()
  })

  const [checkAgainstSanctions] = useLazyQuery(CHECK_AGAINST_SANCTIONS, {
    onCompleted: () => getCustomer()
  })

  const updateCustomer = it =>
    setCustomer({
      variables: {
        customerId,
        customerInput: it
      }
    })

  const replacePhoto = it => {
    replaceCustomerPhoto({
      variables: {
        customerId,
        newPhoto: it.newPhoto,
        photoType: it.photoType
      }
    })
    setWizard(null)
  }

  const editCustomer = it => {
    editCustomerData({
      variables: {
        customerId,
        customerEdit: it
      }
    })
    setWizard(null)
  }

  const deleteEditedData = it =>
    deleteCustomerEditedData({
      variables: {
        customerId,
        customerEdit: it
      }
    })

  const createCustomerNote = it =>
    createNote({
      variables: {
        customerId,
        title: it.title,
        content: it.content
      }
    })

  const deleteCustomerNote = it =>
    deleteNote({
      variables: {
        noteId: it.noteId
      }
    })

  const editCustomerNote = it =>
    editNote({
      variables: {
        noteId: it.noteId,
        newContent: it.newContent
      }
    })

  const retrieveAdditionalData = () =>
    setCustomer({
      variables: {
        customerId,
        customerInput: {
          subscriberInfo: true
        }
      }
    })

  const onClickSidebarItem = code => setClickedItem(code)

  const configData = R.path(['config'])(customerResponse) ?? []
  const locale = configData && fromNamespace(namespaces.LOCALE, configData)
  const customerData = R.path(['customer'])(customerResponse) ?? []
  const rawTransactions = R.path(['transactions'])(customerData) ?? []
  const sortedTransactions = R.sort(R.descend(R.prop('cryptoAtoms')))(
    rawTransactions
  )
  const name = getName(customerData)
  const blocked =
    R.path(['authorizedOverride'])(customerData) === OVERRIDE_REJECTED

  const isSuspended = customerData.isSuspended
  const isCustomerData = clickedItem === 'customerData'
  const isOverview = clickedItem === 'overview'
  const isNotes = clickedItem === 'notes'
  const isPhotos = clickedItem === 'photos'

  const frontCameraData = R.pick(['frontCameraPath', 'frontCameraAt'])(
    customerData
  )
  const txPhotosData =
    sortedTransactions &&
    R.map(R.pick(['id', 'txCustomerPhotoPath', 'txCustomerPhotoAt']))(
      sortedTransactions
    )

  const photosData = formatPhotosData(R.append(frontCameraData, txPhotosData))
  const IDphotoData = customerData.idCardPhotoPath
    ? [
        {
          photoDir: 'id-card-photo',
          path: customerData.idCardPhotoPath,
          date: customerData.idCardPhotoAt
        }
      ]
    : []

  const loading = customerLoading || configLoading

  const timezone = R.path(['config', 'locale_timezone'], configResponse)

  const customInfoRequirementOptions =
    activeCustomRequests?.customInfoRequests?.map(it => ({
      value: it.id,
      display: it.customRequest.name
    })) ?? []

  const email = R.path(['email'])(customerData)
  const phone = R.path(['phone'])(customerData)

  return (
    <>
      <Breadcrumbs
        className="my-5"
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb">
        <Label1
          noMargin
          className="cursor-pointer text-comet"
          onClick={() => history.push('/compliance/customers')}>
          Customers
        </Label1>
        <Label2 noMargin className="cursor-pointer text-comet">
          {name.length
            ? name
            : email?.length
              ? email
              : getFormattedPhone(phone, locale.country)}
        </Label2>
      </Breadcrumbs>
      <div className="flex gap-20">
        <div className="w-55 flex flex-col gap-6">
          {!loading && !customerData.isAnonymous && (
            <>
              <CustomerSidebar
                isSelected={code => code === clickedItem}
                onClick={onClickSidebarItem}
              />
              <div>
                <Label1 noMargin className="text-comet my-1">
                  Actions
                </Label1>
                <div className="flex flex-col gap-1">
                  <ActionButton
                    center
                    color="primary"
                    Icon={DataIcon}
                    InverseIcon={DataReversedIcon}
                    onClick={() => setWizard(true)}>
                    {`Manual data entry`}
                  </ActionButton>
                  {/* <ActionButton
                    color="primary"
                    Icon={Discount}
                    InverseIcon={DiscountReversedIcon}
                    onClick={() => {}}>
                    {`Add individual discount`}
                  </ActionButton> */}
                  {isSuspended && (
                    <ActionButton
                      center
                      color="primary"
                      Icon={AuthorizeIcon}
                      InverseIcon={AuthorizeReversedIcon}
                      onClick={() =>
                        updateCustomer({
                          suspendedUntil: null
                        })
                      }>
                      {`Unsuspend customer`}
                    </ActionButton>
                  )}
                  <ActionButton
                    color="primary"
                    center
                    Icon={blocked ? AuthorizeIcon : BlockIcon}
                    InverseIcon={
                      blocked ? AuthorizeReversedIcon : BlockReversedIcon
                    }
                    onClick={() =>
                      updateCustomer({
                        authorizedOverride: blocked
                          ? OVERRIDE_AUTHORIZED
                          : OVERRIDE_REJECTED
                      })
                    }>
                    {`${blocked ? 'Authorize' : 'Block'} customer`}
                  </ActionButton>
                </div>
              </div>
              <div>
                <Label1 className="text-comet my-1">
                  {`Special user status`}
                </Label1>
                <div className="flex flex-col">
                  <div className="flex items-center bg-zircon px-1 rounded-lg">
                    <Switch
                      checked={!!R.path(['isTestCustomer'])(customerData)}
                      value={!!R.path(['isTestCustomer'])(customerData)}
                      onChange={() =>
                        R.path(['isTestCustomer'])(customerData)
                          ? disableTestCustomer()
                          : enableTestCustomer()
                      }
                    />
                    <Label1 noMargin>Test user</Label1>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex-1">
          {isOverview && (
            <div>
              <div className="flex justify-between mb-5">
                <CustomerDetails
                  customer={customerData}
                  photosData={photosData}
                  locale={locale}
                  setShowCompliance={() => setShowCompliance(!showCompliance)}
                  timezone={timezone}
                />
              </div>
              <div>
                <TransactionsList
                  customer={customerData}
                  data={sortedTransactions}
                  loading={loading}
                />
              </div>
            </div>
          )}
          {isCustomerData && (
            <div>
              <CustomerData
                locale={locale}
                customer={customerData}
                updateCustomer={updateCustomer}
                replacePhoto={replacePhoto}
                editCustomer={editCustomer}
                deleteEditedData={deleteEditedData}
                updateCustomRequest={setCustomerCustomInfoRequest}
                authorizeCustomRequest={authorizeCustomRequest}
                updateCustomEntry={updateCustomEntry}
                setRetrieve={setRetrieve}
                checkAgainstSanctions={checkAgainstSanctions}
                retrieveAdditionalDataDialog={
                  <RetrieveDataDialog
                    onDismissed={() => {
                      setError(null)
                      setRetrieve(false)
                    }}
                    onConfirmed={() => {
                      setError(null)
                      retrieveAdditionalData()
                    }}
                    error={error}
                    open={retrieve}></RetrieveDataDialog>
                }></CustomerData>
            </div>
          )}
          {isNotes && (
            <div>
              <CustomerNotes
                customer={customerData}
                createNote={createCustomerNote}
                deleteNote={deleteCustomerNote}
                editNote={editCustomerNote}
                timezone={timezone}></CustomerNotes>
            </div>
          )}
          {isPhotos && (
            <div>
              <CustomerPhotos
                photosData={R.concat(photosData, IDphotoData)}
                timezone={timezone}
              />
            </div>
          )}
        </div>
        {wizard && (
          <Wizard
            error={error?.message}
            save={saveCustomEntry}
            addPhoto={replacePhoto}
            addCustomerData={editCustomer}
            onClose={() => setWizard(null)}
            customInfoRequirementOptions={customInfoRequirementOptions}
          />
        )}
      </div>
    </>
  )
})

const RetrieveDataDialog = ({
  onConfirmed,
  onDismissed,
  open,
  error,
  props
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        style: {
          borderRadius: 8,
          minWidth: 656,
          bottom: 125,
          right: 7
        }
      }}
      {...props}>
      <div className="pt-4 pr-4 flex justify-end">
        <IconButton aria-label="close" onClick={() => onDismissed(false)}>
          <SvgIcon>
            <CloseIcon />
          </SvgIcon>
        </IconButton>
      </div>
      <H2 className="mb-2 ml-10">{'Retrieve API data from Twilio'}</H2>
      <DialogContent className="w-153 ml-4">
        <Info3>{`With this action you'll be using Twilio's API to retrieve additional
  data from this user. This includes name and address, if available.\n`}</Info3>
        <Info3>{` There is a small cost from Twilio for each retrieval. Would you like
  to proceed?`}</Info3>
      </DialogContent>
      {error && (
        <ErrorMessage className="ml-10">
          Failed to fetch additional data
        </ErrorMessage>
      )}
      <DialogActions className="p-8 pt-4 gap-2">
        <Button backgroundColor="grey" onClick={() => onDismissed(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirmed()
          }}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerProfile
