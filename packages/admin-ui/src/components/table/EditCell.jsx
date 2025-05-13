import React, { memo } from 'react'

import { Link } from '../buttons'
import { TableCell as Td } from './'

const EditCell = memo(({ save, cancel }) => (
  <Td>
    <Link style={{ marginRight: '20px' }} color="secondary" onClick={cancel}>
      Cancel
    </Link>
    <Link color="primary" onClick={save}>
      Save
    </Link>
  </Td>
))

export default EditCell
