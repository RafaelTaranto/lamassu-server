import Paper from '@mui/material/Paper'
import { format } from 'date-fns/fp'
import * as R from 'ramda'
import { React, useState } from 'react'
import { InformativeDialog } from 'src/components/InformativeDialog'
import { Label2, H3 } from 'src/components/typography'
import CameraIcon from 'src/styling/icons/ID/photo/comet.svg?react'

import PhotosCarousel from './components/PhotosCarousel'

const CustomerPhotos = ({ photosData, timezone }) => {
  const [photosDialog, setPhotosDialog] = useState(false)
  const [photoClickedIndex, setPhotoClickIndex] = useState(null)
  const orderedPhotosData = !R.isNil(photoClickedIndex)
    ? R.compose(R.flatten, R.reverse, R.splitAt(photoClickedIndex))(photosData)
    : photosData

  return (
    <div>
      <H3 className="mt-1 mb-7">{'Photos & files'}</H3>
      <div className="flex flex-wrap gap-4">
        {photosData.map((elem, idx) => (
          <PhotoCard
            key={idx}
            date={elem.date}
            src={`/${elem.photoDir}/${elem.path}`}
            setPhotosDialog={setPhotosDialog}
            setPhotoClickIndex={setPhotoClickIndex}
          />
        ))}
      </div>
      <InformativeDialog
        open={photosDialog}
        title={`Photo roll`}
        data={
          <PhotosCarousel photosData={orderedPhotosData} timezone={timezone} />
        }
        onDissmised={() => {
          setPhotosDialog(false)
          setPhotoClickIndex(null)
        }}
      />
    </div>
  )
}

export const PhotoCard = ({
  idx,
  date,
  src,
  setPhotosDialog,
  setPhotoClickIndex,
}) => {
  return (
    <Paper
      className="cursor-pointer overflow-hidden"
      onClick={() => {
        setPhotoClickIndex(idx)
        setPhotosDialog(true)
      }}>
      <img
        className="w-56 h-50 object-cover object-center block"
        src={src}
        alt=""
      />
      <div className="flex p-3 gap-3">
        <CameraIcon />
        <Label2 noMargin>{format('yyyy-MM-dd', new Date(date))}</Label2>
      </div>
    </Paper>
  )
}

export default CustomerPhotos
