import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState } from 'react'

import { Link, Button } from 'src/components/buttons'
import { DeleteDialog } from 'src/components/DeleteDialog'
import DataTable from 'src/components/tables/DataTable'
import { Label3, TL1 } from 'src/components/typography'
import PhoneIdIcon from 'src/styling/icons/ID/phone/zodiac.svg?react'
import DeleteIcon from 'src/styling/icons/action/delete/enabled.svg?react'

import IndividualDiscountModal from './IndividualDiscountModal'
import classnames from 'classnames'

const GET_INDIVIDUAL_DISCOUNTS = gql`
  query individualDiscounts {
    individualDiscounts {
      id
      customer {
        id
        phone
        idCardData
      }
      discount
    }
  }
`

const DELETE_DISCOUNT = gql`
  mutation deleteIndividualDiscount($discountId: ID!) {
    deleteIndividualDiscount(discountId: $discountId) {
      id
    }
  }
`

const CREATE_DISCOUNT = gql`
  mutation createIndividualDiscount($customerId: ID!, $discount: Int!) {
    createIndividualDiscount(customerId: $customerId, discount: $discount) {
      id
    }
  }
`

const GET_CUSTOMERS = gql`
  {
    customers {
      id
      phone
      idCardData
    }
  }
`

const IndividualDiscounts = () => {
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [toBeDeleted, setToBeDeleted] = useState()

  const [errorMsg, setErrorMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const toggleModal = () => setShowModal(!showModal)

  const { data: discountResponse, loading } = useQuery(GET_INDIVIDUAL_DISCOUNTS)
  const { data: customerData, loading: customerLoading } =
    useQuery(GET_CUSTOMERS)

  const [createDiscount, { error: creationError }] = useMutation(
    CREATE_DISCOUNT,
    {
      refetchQueries: () => ['individualDiscounts']
    }
  )

  const [deleteDiscount] = useMutation(DELETE_DISCOUNT, {
    onError: ({ message }) => {
      const errorMessage = message ?? 'Error while deleting row'
      setErrorMsg(errorMessage)
    },
    onCompleted: () => setDeleteDialog(false),
    refetchQueries: () => ['individualDiscounts']
  })

  const elements = [
    {
      header: 'Identification',
      width: 312,
      textAlign: 'left',
      size: 'sm',
      view: t => {
        return (
          <div className="flex items-center gap-2">
            <PhoneIdIcon />
            <span>{t.customer.phone}</span>
          </div>
        )
      }
    },
    {
      header: 'Name',
      width: 300,
      textAlign: 'left',
      size: 'sm',
      view: t => {
        const customer = t.customer
        if (R.isNil(customer.idCardData)) {
          return <>{'-'}</>
        }

        return (
          <>{`${customer.idCardData.firstName ?? ``}${
            customer.idCardData.firstName && customer.idCardData.lastName
              ? ` `
              : ``
          }${customer.idCardData.lastName ?? ``}`}</>
        )
      }
    },
    {
      header: 'Discount rate',
      width: 220,
      textAlign: 'left',
      size: 'sm',
      view: t => (
        <>
          <TL1 inline>{t.discount}</TL1> %
        </>
      )
    },
    {
      header: 'Revoke',
      width: 100,
      textAlign: 'center',
      size: 'sm',
      view: t => (
        <IconButton
          onClick={() => {
            setDeleteDialog(true)
            setToBeDeleted({ variables: { discountId: t.id } })
          }}>
          <SvgIcon>
            <DeleteIcon />
          </SvgIcon>
        </IconButton>
      )
    }
  ]

  return (
    <>
      {!loading && !R.isEmpty(discountResponse.individualDiscounts) && (
        <>
          <div className="flex justify-end mb-8 -mt-14">
            <Link
              color="primary"
              onClick={toggleModal}
              className={classnames({ 'cursor-wait': customerLoading })}
              disabled={customerLoading}>
              Add new code
            </Link>
          </div>
          <DataTable
            elements={elements}
            data={R.path(['individualDiscounts'])(discountResponse)}
          />
          <DeleteDialog
            open={deleteDialog}
            onDismissed={() => {
              setDeleteDialog(false)
              setErrorMsg(null)
            }}
            onConfirmed={() => {
              setErrorMsg(null)
              deleteDiscount(toBeDeleted)
            }}
            errorMessage={errorMsg}
          />
        </>
      )}
      {!loading && R.isEmpty(discountResponse.individualDiscounts) && (
        <div className="flex items-start flex-col">
          <Label3>
            It seems there are no active individual customer discounts on your
            network.
          </Label3>
          <Button onClick={toggleModal}>Add individual discount</Button>
        </div>
      )}
      <IndividualDiscountModal
        showModal={showModal}
        setShowModal={setShowModal}
        onClose={() => {
          setShowModal(false)
        }}
        creationError={creationError}
        addDiscount={createDiscount}
        customers={R.path(['customers'])(customerData)}
      />
    </>
  )
}

export default IndividualDiscounts
