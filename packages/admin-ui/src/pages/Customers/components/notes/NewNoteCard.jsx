import Paper from '@mui/material/Paper'
import { React } from 'react'
import { P } from '../../../../components/typography'
import AddIcon from '../../../../styling/icons/button/add/zodiac.svg?react'

const NewNoteCard = ({ setOpenModal }) => {
  return (
    <Paper
      className="cursor-pointer bg-zircon flex flex-col justify-center items-center"
      onClick={() => setOpenModal(true)}>
      <AddIcon width={20} height={20} />
      <P>Add new</P>
    </Paper>
  )
}

export default NewNoteCard
