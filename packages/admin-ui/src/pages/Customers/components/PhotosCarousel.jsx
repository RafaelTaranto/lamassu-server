import * as R from 'ramda'
import React, { memo, useState } from 'react'
import { Carousel } from '../../../components/Carousel'
import { Label1 } from '../../../components/typography'

import { formatDate } from '../../../utils/timezones'

import CopyToClipboard from '../../../components/CopyToClipboard.jsx'

const PhotosCarousel = memo(({ photosData, timezone }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const Label = ({ children }) => {
    return (
      <Label1 noMargin className="mb-1 text-comet">
        {children}
      </Label1>
    )
  }

  const isFaceCustomerPhoto = !R.has('id')(photosData[currentIndex])

  const slidePhoto = index => setCurrentIndex(index)

  // TODO hide copy to clipboard shit
  return (
    <>
      <Carousel photosData={photosData} slidePhoto={slidePhoto} />
      {!isFaceCustomerPhoto && (
        <div className="flex flex-col p-2">
          <Label>Session ID</Label>
          <CopyToClipboard>
            {photosData && photosData[currentIndex]?.id}
          </CopyToClipboard>
        </div>
      )}
      <div className="text-zodiac flex p-2 gap-8">
        <div>
          <>
            <Label>Date</Label>
            <div>
              {photosData &&
                formatDate(
                  photosData[currentIndex]?.date,
                  timezone,
                  'yyyy-MM-dd HH:mm',
                )}
            </div>
          </>
        </div>
        <div>
          <Label>Taken by</Label>
          <div>
            {!isFaceCustomerPhoto ? 'Acceptance of T&C' : 'Compliance scan'}
          </div>
        </div>
      </div>
    </>
  )
})

export default PhotosCarousel
