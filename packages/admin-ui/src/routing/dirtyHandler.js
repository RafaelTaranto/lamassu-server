import { create } from 'zustand'

const useDirtyHandler = create(set => ({
  isDirty: false,
  setIsDirty: it => set({ isDirty: it }),
}))

export default useDirtyHandler
