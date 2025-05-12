import Paper from '@mui/material/Paper'
import * as R from 'ramda'
import { React } from 'react'
import { H3, P } from 'src/components/typography'
import DeleteIcon from 'src/styling/icons/action/delete/enabled.svg?react'

import { formatDate } from 'src/utils/timezones'

const formatContent = content => {
  const fragments = R.split(/\n/)(content)
  return R.map((it, idx) => {
    if (idx === fragments.length) return <>{it}</>
    return (
      <>
        {it}
        <br />
      </>
    )
  }, fragments)
}

const NoteCard = ({ note, deleteNote, handleClick, timezone }) => {
  return (
    <Paper
      className="p-2 cursor-pointer overflow-hidden text-ellipsis"
      onClick={() => handleClick(note)}>
      <div className="flex flex-row justify-between w-full">
        <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
          <H3 noMargin>{note?.title}</H3>
          <P noMargin>{formatDate(note?.created, timezone, 'yyyy-MM-dd')}</P>
        </div>
        <div>
          <DeleteIcon
            onClick={e => {
              e.stopPropagation()
              deleteNote({ noteId: note.id })
            }}
          />
        </div>
      </div>
      <P noMargin className="mt-2 line-clamp-8">
        {formatContent(note?.content)}
      </P>
    </Paper>
  )
}

export default NoteCard
