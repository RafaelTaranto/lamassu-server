import { useFormikContext } from 'formik'
import * as R from 'ramda'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Label3, H3 } from 'src/components/typography'
import UploadPhotoIcon from 'src/styling/icons/button/photo/zodiac-resized.svg?react'
import UploadFileIcon from 'src/styling/icons/button/upload-file/zodiac-resized.svg?react'

import classes from './Upload.module.css'

const Upload = ({ type }) => {
  const [data, setData] = useState({})

  const { setFieldValue } = useFormikContext()

  const IMAGE = 'image'
  const ID_CARD_PHOTO = 'idCardPhoto'
  const FRONT_CAMERA = 'frontCamera'

  const isImage =
    type === IMAGE || type === FRONT_CAMERA || type === ID_CARD_PHOTO

  const onDrop = useCallback(
    acceptedData => {
      setFieldValue(type, R.head(acceptedData))

      setData({
        preview: isImage
          ? URL.createObjectURL(R.head(acceptedData))
          : R.head(acceptedData).name,
      })
    },
    [isImage, type, setFieldValue],
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <>
      <div {...getRootProps()} className="mt-10 w-112 h-30">
        {R.isEmpty(data) && (
          <div className={classes.box}>
            <input {...getInputProps()} />
            {isImage ? <UploadPhotoIcon /> : <UploadFileIcon />}
            <Label3>{`Drag and drop ${
              isImage ? 'an image' : 'a file'
            } or click to open the explorer`}</Label3>
          </div>
        )}
        {!R.isEmpty(data) && isImage && (
          <div key={data.name}>
            <img src={data.preview} className={classes.box} alt=""></img>
          </div>
        )}
        {!R.isEmpty(data) && !isImage && (
          <div className={classes.box}>
            <H3 className="mt-12 flex">{data.preview}</H3>
          </div>
        )}
      </div>
    </>
  )
}

export default Upload
