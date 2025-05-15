import useDirtyHandler from './dirtyHandler.js'
import { useEffect, useRef } from 'react'
import { useBrowserLocation } from 'wouter/use-browser-location'

const PROMPT_DEFAULT_MESSAGE =
  'You have unsaved changes on this page. Are you sure you want to leave?'

const useLocationWithConfirmation = () => {
  const setIsDirty = useDirtyHandler(state => state.setIsDirty)
  const isDirtyRef = useRef(useDirtyHandler.getState().isDirty)
  useEffect(
    () =>
      useDirtyHandler.subscribe(state => (isDirtyRef.current = state.isDirty)),
    [],
  )
  const [location, setLocation] = useBrowserLocation()

  return [
    location,
    newLocation => {
      let perfomNavigation = true
      if (isDirtyRef.current) {
        perfomNavigation = window.confirm(PROMPT_DEFAULT_MESSAGE)
      }

      if (perfomNavigation) {
        setLocation(newLocation)
        setIsDirty(false)
      }
    },
  ]
}

export default useLocationWithConfirmation
