import { makeStyles } from '@mui/styles'
import * as R from 'ramda'
import React, { memo } from 'react'
import CrossedCameraIcon from 'src/styling/icons/ID/photo/crossed-camera.svg?react'

import {
  PropertyCard,
  OVERRIDE_AUTHORIZED,
  OVERRIDE_REJECTED
} from 'src/pages/Customers/components/propertyCard'

const useStyles = makeStyles({
  idCardPhotoCard: {
    width: 325,
    height: 240,
    margin: [[32, 0, 0, 0]]
  },
  idCardPhoto: {
    maxHeight: 130
  },
  field: {
    marginLeft: 14
  }
})

const IdCardPhotoCard = memo(({ customerData, updateCustomer }) => {
  const classes = useStyles()

  return (
    <PropertyCard
      title={'ID card image'}
      state={R.path(['idCardPhotoOverride'])(customerData)}
      authorize={() =>
        updateCustomer({ idCardPhotoOverride: OVERRIDE_AUTHORIZED })
      }
      reject={() => updateCustomer({ idCardPhotoOverride: OVERRIDE_REJECTED })}>
      <div className="flex flex-1 justify-center items-center">
        {customerData.idCardPhotoPath ? (
          <img
            className={classes.idCardPhoto}
            src={`/id-card-photo/${R.path(['idCardPhotoPath'])(customerData)}`}
            alt=""
          />
        ) : (
          <CrossedCameraIcon />
        )}
      </div>
    </PropertyCard>
  )
})

export default IdCardPhotoCard
