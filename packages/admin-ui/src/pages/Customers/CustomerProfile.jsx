import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Switch from '@mui/material/Switch'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import * as R from 'ramda'
import React, { memo, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { Label1, Label2 } from '../../components/typography'
import AuthorizeReversedIcon from '../../styling/icons/button/authorize/white.svg?react'
import AuthorizeIcon from '../../styling/icons/button/authorize/zodiac.svg?react'
import BlockReversedIcon from '../../styling/icons/button/block/white.svg?react'
import BlockIcon from '../../styling/icons/button/block/zodiac.svg?react'
import DataReversedIcon from '../../styling/icons/button/data/white.svg?react'
import DataIcon from '../../styling/icons/button/data/zodiac.svg?react'

import { ActionButton } from '../../components/buttons'
import { OVERRIDE_AUTHORIZED, OVERRIDE_REJECTED } from './components/consts'
// TODO: Enable for next release
// import DiscountReversedIcon from '../../styling/icons/button/discount/white.svg?react'
// import Discount from '../../styling/icons/button/discount/zodiac.svg?react'
import { fromNamespace, namespaces } from '../../utils/config'

import CustomerData from './CustomerData'
import CustomerNotes from './CustomerNotes'
import CustomerPhotos from './CustomerPhotos'
import {
  CustomerDetails,
  TransactionsList,
  CustomerSidebar,
  Wizard,
} from './components'
import { getFormattedPhone, getName, formatPhotosData } from './helper'

const GET_CUSTOMER = gql`
  query customer($customerId: ID!) {
    config
    transactions(customerId: $customerId, limit: 20) {
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
  const [, navigate] = useLocation()
  const [showCompliance, setShowCompliance] = useState(false)
  const [wizard, setWizard] = useState(false)
  const [error, setError] = useState(null)
  const [clickedItem, setClickedItem] = useState('overview')
  const { id: customerId } = useParams()

  const {
    data: customerResponse,
    refetch: getCustomer,
    loading: customerLoading,
  } = useQuery(GET_CUSTOMER, {
    notifyOnNetworkStatusChange: true,
    variables: { customerId },
    skip: !customerId,
  })

  const { data: activeCustomRequests } = useQuery(GET_ACTIVE_CUSTOM_REQUESTS, {
    variables: {
      onlyEnabled: true,
    },
  })

  const [setCustomEntry] = useMutation(SET_CUSTOM_ENTRY, {
    onCompleted: () => getCustomer(),
  })

  const [editCustomEntry] = useMutation(EDIT_CUSTOM_ENTRY, {
    onCompleted: () => getCustomer(),
  })

  const [replaceCustomerPhoto] = useMutation(REPLACE_CUSTOMER_PHOTO, {
    onCompleted: () => getCustomer(),
  })

  const [editCustomerData] = useMutation(EDIT_CUSTOMER, {
    onCompleted: () => getCustomer(),
  })

  const [deleteCustomerEditedData] = useMutation(DELETE_EDITED_CUSTOMER, {
    onCompleted: () => getCustomer(),
  })

  const [setCustomer] = useMutation(SET_CUSTOMER, {
    onCompleted: () => {
      getCustomer()
    },
    onError: error => setError(error),
  })

  const [authorizeCustomRequest] = useMutation(SET_AUTHORIZED_REQUEST, {
    onCompleted: () => getCustomer(),
  })

  const [setCustomerCustomInfoRequest] = useMutation(
    SET_CUSTOMER_CUSTOM_INFO_REQUEST,
    {
      onCompleted: () => getCustomer(),
    },
  )

  const [createNote] = useMutation(CREATE_NOTE, {
    onCompleted: () => getCustomer(),
  })

  const [deleteNote] = useMutation(DELETE_NOTE, {
    onCompleted: () => getCustomer(),
  })

  const [editNote] = useMutation(EDIT_NOTE, {
    onCompleted: () => getCustomer(),
  })

  const saveCustomEntry = it => {
    setCustomEntry({
      variables: {
        customerId,
        label: it.title,
        value: it.data,
      },
    })
    setWizard(null)
  }

  const updateCustomEntry = it => {
    editCustomEntry({
      variables: {
        customerId,
        fieldId: it.fieldId,
        value: it.value,
      },
    })
  }

  const [enableTestCustomer] = useMutation(ENABLE_TEST_CUSTOMER, {
    variables: { customerId },
    onCompleted: () => getCustomer(),
  })

  const [disableTestCustomer] = useMutation(DISABLE_TEST_CUSTOMER, {
    variables: { customerId },
    onCompleted: () => getCustomer(),
  })

  const [checkAgainstSanctions] = useLazyQuery(CHECK_AGAINST_SANCTIONS, {
    onCompleted: () => getCustomer(),
  })

  const updateCustomer = it =>
    setCustomer({
      variables: {
        customerId,
        customerInput: it,
      },
    })

  const replacePhoto = it => {
    replaceCustomerPhoto({
      variables: {
        customerId,
        newPhoto: it.newPhoto,
        photoType: it.photoType,
      },
    })
    setWizard(null)
  }

  const editCustomer = it => {
    editCustomerData({
      variables: {
        customerId,
        customerEdit: it,
      },
    })
    setWizard(null)
  }

  const deleteEditedData = it =>
    deleteCustomerEditedData({
      variables: {
        customerId,
        customerEdit: it,
      },
    })

  const createCustomerNote = it =>
    createNote({
      variables: {
        customerId,
        title: it.title,
        content: it.content,
      },
    })

  const deleteCustomerNote = it =>
    deleteNote({
      variables: {
        noteId: it.noteId,
      },
    })

  const editCustomerNote = it =>
    editNote({
      variables: {
        noteId: it.noteId,
        newContent: it.newContent,
      },
    })

  const onClickSidebarItem = code => setClickedItem(code)

  const locale = fromNamespace(
    namespaces.LOCALE,
    customerResponse?.config ?? {},
  )
  const customerData = R.path(['customer'])(customerResponse) ?? []
  const rawTransactions = R.path(['transactions'])(customerResponse) ?? []
  const sortedTransactions = R.sort(R.descend(R.prop('cryptoAtoms')))(
    rawTransactions,
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
    customerData,
  )
  const txPhotosData =
    sortedTransactions &&
    R.map(R.pick(['id', 'txCustomerPhotoPath', 'txCustomerPhotoAt']))(
      sortedTransactions,
    )

  const photosData = formatPhotosData(R.append(frontCameraData, txPhotosData))
  const IDphotoData = customerData.idCardPhotoPath
    ? [
        {
          photoDir: 'id-card-photo',
          path: customerData.idCardPhotoPath,
          date: customerData.idCardPhotoAt,
        },
      ]
    : []

  const loading = customerLoading

  const timezone = locale.timezone

  const customInfoRequirementOptions =
    activeCustomRequests?.customInfoRequests?.map(it => ({
      value: it.id,
      display: it.customRequest.name,
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
          onClick={() => navigate('/compliance/customers')}>
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
          {!!customerData && !customerData.isAnonymous && (
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
                          suspendedUntil: null,
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
                          : OVERRIDE_REJECTED,
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
                checkAgainstSanctions={checkAgainstSanctions}
              />
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

export default CustomerProfile
