import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import TitleSection from '../../components/layout/TitleSection'
import TxInIcon from '../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'

import { Link } from '../../components/buttons'
import { fromNamespace, namespaces } from '../../utils/config'

import CustomersList from './CustomersList'
import CreateCustomerModal from './components/CreateCustomerModal'
import { getAuthorizedStatus } from './helper'

const GET_CUSTOMERS = gql`
  query configAndCustomers(
    $phone: String
    $name: String
    $email: String
    $address: String
    $id: String
  ) {
    config
    customers(
      phone: $phone
      email: $email
      name: $name
      address: $address
      id: $id
    ) {
      id
      idCardData
      phone
      email
      totalTxs
      totalSpent
      lastActive
      lastTxFiat
      lastTxFiatCode
      lastTxClass
      authorizedOverride
      frontCameraPath
      frontCameraOverride
      idCardPhotoPath
      idCardPhotoOverride
      idCardData
      idCardDataOverride
      usSsn
      usSsnOverride
      sanctions
      sanctionsOverride
      daysSuspended
      isSuspended
      customInfoRequests {
        customerId
        infoRequestId
        override
        overrideAt
        overrideBy
        customerData
        customInfoRequest {
          id
          enabled
          customRequest
        }
      }
    }
    customInfoRequests {
      id
    }
  }
`

const CREATE_CUSTOMER = gql`
  mutation createCustomer($phoneNumber: String) {
    createCustomer(phoneNumber: $phoneNumber) {
      phone
    }
  }
`

const Customers = () => {
  const [, navigate] = useLocation()

  const handleCustomerClicked = customer =>
    navigate(`/compliance/customer/${customer.id}`)

  const [showCreationModal, setShowCreationModal] = useState(false)

  const { data: customersResponse, loading: customerLoading } =
    useQuery(GET_CUSTOMERS)

  const [createNewCustomer] = useMutation(CREATE_CUSTOMER, {
    onCompleted: () => setShowCreationModal(false),
    refetchQueries: () => [GET_CUSTOMERS],
  })

  const configData = R.path(['config'])(customersResponse) ?? []
  const customRequirementsData =
    R.path(['customInfoRequests'], customersResponse) ?? []
  const locale = configData && fromNamespace(namespaces.LOCALE, configData)
  const triggers = configData && fromNamespace(namespaces.TRIGGERS, configData)

  const setAuthorizedStatus = c =>
    R.assoc(
      'authorizedStatus',
      getAuthorizedStatus(c, triggers, customRequirementsData),
      c,
    )

  const byAuthorized = c => (c.authorizedStatus.label === 'Pending' ? 0 : 1)
  const byLastActive = c => new Date(R.prop('lastActive', c) ?? '0')

  const customers = R.path(['customers'])(customersResponse) ?? []
  const customersData = R.pipe(
    R.map(setAuthorizedStatus),
    R.sortWith([R.ascend(byAuthorized), R.descend(byLastActive)]),
  )(customers ?? [])

  return (
    <>
      <TitleSection
        title="Customers"
        appendixRight={
          <div className="flex">
            <Link color="primary" onClick={() => setShowCreationModal(true)}>
              Add new user
            </Link>
          </div>
        }
        labels={[
          { label: 'Cash-in', icon: <TxInIcon /> },
          { label: 'Cash-out', icon: <TxOutIcon /> },
        ]}
      />
      <CustomersList
        data={customersData}
        country={locale?.country}
        onClick={handleCustomerClicked}
        loading={customerLoading}
      />
      <CreateCustomerModal
        showModal={showCreationModal}
        handleClose={() => setShowCreationModal(false)}
        locale={locale}
        onSubmit={createNewCustomer}
      />
    </>
  )
}

export default Customers
