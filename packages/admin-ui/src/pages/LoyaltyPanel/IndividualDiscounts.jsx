import { useQuery, useMutation, gql } from '@apollo/client'
import * as R from 'ramda'
import React, { useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  useMaterialReactTable,
} from 'material-react-table'
import Delete from '@mui/icons-material/Delete'

import { Link, Button } from '../../components/buttons'
import { DeleteDialog } from '../../components/DeleteDialog'
import { Label3, TL1 } from '../../components/typography'
import PhoneIdIcon from '../../styling/icons/ID/phone/zodiac.svg?react'
import { defaultMaterialTableOpts } from '../../utils/materialReactTableOpts'

import IndividualDiscountModal from './IndividualDiscountModal'

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

const IndividualDiscounts = () => {
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [toBeDeleted, setToBeDeleted] = useState()

  const [errorMsg, setErrorMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const toggleModal = () => setShowModal(!showModal)

  const { data: discountResponse, loading } = useQuery(
    GET_INDIVIDUAL_DISCOUNTS,
    { notifyOnNetworkStatusChange: true },
  )
  const discounts = discountResponse?.individualDiscounts || []

  const [createDiscount, { error: creationError }] = useMutation(
    CREATE_DISCOUNT,
    {
      refetchQueries: () => ['individualDiscounts'],
    },
  )

  const [deleteDiscount] = useMutation(DELETE_DISCOUNT, {
    onError: ({ message }) => {
      const errorMessage = message ?? 'Error while deleting row'
      setErrorMsg(errorMessage)
    },
    onCompleted: () => setDeleteDialog(false),
    refetchQueries: () => ['individualDiscounts'],
  })

  const columns = useMemo(
    () => [
      {
        id: 'identification',
        header: 'Identification',
        size: 312,
        accessorFn: row => row.customer.phone,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <PhoneIdIcon />
            <span>{row.original.customer.phone}</span>
          </div>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        size: 300,
        accessorFn: row => {
          const customer = row.customer
          if (R.isNil(customer.idCardData)) {
            return '-'
          }
          return `${customer.idCardData.firstName ?? ''}${
            customer.idCardData.firstName && customer.idCardData.lastName
              ? ' '
              : ''
          }${customer.idCardData.lastName ?? ''}`
        },
      },
      {
        id: 'discount',
        header: 'Discount rate',
        size: 220,
        accessorKey: 'discount',
        Cell: ({ cell }) => (
          <>
            <TL1 inline>{cell.getValue()}</TL1> %
          </>
        ),
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    ...defaultMaterialTableOpts,
    columns,
    data: discounts,
    state: { isLoading: loading },
    getRowId: row => row.id,
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <MRT_ActionMenuItem
        icon={<Delete />}
        key="delete"
        label="Revoke"
        onClick={() => {
          setDeleteDialog(true)
          setToBeDeleted({ variables: { discountId: row.original.id } })
        }}
        table={table}
      />,
    ],
    initialState: {
      ...defaultMaterialTableOpts.initialState,
      columnPinning: { right: ['mrt-row-actions'] },
    },
  })

  return (
    <>
      {!loading && !R.isEmpty(discounts) && (
        <>
          <div className="flex justify-end mb-8 -mt-14">
            <Link color="primary" onClick={toggleModal}>
              Add new code
            </Link>
          </div>
          <MaterialReactTable table={table} />
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
      {!loading && R.isEmpty(discounts) && (
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
      />
    </>
  )
}

export default IndividualDiscounts
