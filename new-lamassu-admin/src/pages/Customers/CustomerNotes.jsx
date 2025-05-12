import * as R from 'ramda'
import { React, useState } from 'react'
import { H3 } from 'src/components/typography'

import NewNoteCard from './components/notes/NewNoteCard'
import NewNoteModal from './components/notes/NewNoteModal'
import NoteCard from './components/notes/NoteCard'
import NoteEdit from './components/notes/NoteEdit'

const CustomerNotes = ({
  customer,
  createNote,
  deleteNote,
  editNote,
  timezone
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const customerNotes = R.sort(
    (a, b) => new Date(b?.created).getTime() - new Date(a?.created).getTime(),
    customer.notes ?? []
  )

  const handleModalClose = () => {
    setOpenModal(false)
  }

  const handleModalSubmit = it => {
    createNote(it)
    return handleModalClose()
  }

  const cancelNoteEditing = () => {
    setEditing(null)
  }

  const submitNoteEditing = it => {
    if (!R.equals(it.newContent, it.oldContent)) {
      editNote({
        noteId: it.noteId,
        newContent: it.newContent
      })
    }
    setEditing(null)
  }

  return (
    <div>
      <H3 className="mt-1 mb-7">{'Notes'}</H3>
      {R.isNil(editing) && (
        <div className="grid grid-cols-[repeat(4,_200px)] gap-5 auto-rows-[200px]">
          <NewNoteCard setOpenModal={setOpenModal} />
          {customerNotes.map((it, idx) => (
            <NoteCard
              key={idx}
              note={it}
              deleteNote={deleteNote}
              handleClick={setEditing}
              timezone={timezone}
            />
          ))}
        </div>
      )}
      {!R.isNil(editing) && (
        <NoteEdit
          note={editing}
          cancel={cancelNoteEditing}
          edit={submitNoteEditing}
          timezone={timezone}
        />
      )}
      {openModal && (
        <NewNoteModal
          showModal={openModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  )
}

export default CustomerNotes
