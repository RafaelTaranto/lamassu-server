import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Card'
import * as R from 'ramda'
import React, { memo, useState } from 'react'
import { InformativeDialog } from 'src/components/InformativeDialog'
import { Info2 } from 'src/components/typography'
import CrossedCameraIcon from 'src/styling/icons/ID/photo/crossed-camera.svg?react'

import PhotosCarousel from './PhotosCarousel'

const PhotosCard = memo(({ photosData, timezone }) => {
  const [photosDialog, setPhotosDialog] = useState(false)

  const sortedPhotosData = R.sortWith(
    [(a, b) => R.has('id', a) - R.has('id', b), R.descend(R.prop('date'))],
    photosData
  )

  const singlePhoto = R.head(sortedPhotosData)

  return (
    <>
      <Paper
        className="flex justify-center items-center bg-zircon rounded-lg h-34 w-34"
        elevation={0}>
        <ButtonBase
          disabled={!singlePhoto}
          onClick={() => {
            setPhotosDialog(true)
          }}>
          {singlePhoto ? (
            <div>
              <img
                className="w-34 h-34 object-center object-cover block"
                src={`/${singlePhoto.photoDir}/${singlePhoto.path}`}
                alt=""
              />
              <div className=""></div>
              <circle className="absolute top-0 right-0 mr-1 mt-1 bg-ghost rounded-full w-6 h-6 flex items-center justify-center">
                <Info2>{sortedPhotosData.length}</Info2>
              </circle>
            </div>
          ) : (
            <CrossedCameraIcon />
          )}
        </ButtonBase>
      </Paper>
      <InformativeDialog
        open={photosDialog}
        title={`Photo roll`}
        data={
          <PhotosCarousel photosData={sortedPhotosData} timezone={timezone} />
        }
        onDissmised={() => {
          setPhotosDialog(false)
        }}
      />
    </>
  )
})

export default PhotosCard
