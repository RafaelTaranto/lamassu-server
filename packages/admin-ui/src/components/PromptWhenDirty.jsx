import { useFormikContext } from 'formik'
import React, { useEffect } from 'react'

import useDirtyHandler from '../routing/dirtyHandler.js'

const PromptWhenDirty = () => {
  const setIsDirty = useDirtyHandler(state => state.setIsDirty)
  const formik = useFormikContext()

  const hasChanges = formik.dirty && formik.submitCount === 0

  useEffect(() => {
    setIsDirty(hasChanges)
  }, [hasChanges])

  return <></>
}

export default PromptWhenDirty
