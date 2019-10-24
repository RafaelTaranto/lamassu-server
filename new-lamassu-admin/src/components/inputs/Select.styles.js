import { zircon, comet, white } from '../../styling/variables'

const WIDTH = 152

export default {
  select: {
    width: `${WIDTH}px`,
    marginBottom: '20px',
    '& button': {
      position: 'relative',
      border: 0,
      backgroundColor: zircon,
      width: `${WIDTH}px`,
      padding: '6px 0 6px 12px',
      borderRadius: '20px',
      fontFamily: 'MuseoSans',
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '1.14',
      textAlign: 'left',
      color: comet,
      cursor: 'pointer',
      outline: '0 none'
    },
    '& ul': {
      maxHeight: '200px',
      width: `${WIDTH}px`,
      overflowY: 'auto',
      position: 'absolute',
      margin: 0,
      borderTop: 0,
      padding: 0,
      borderRadius: '0 0 16px 16px',
      backgroundColor: zircon,
      outline: '0 none',
      '& li': {
        listStyleType: 'none',
        padding: '6px 0 6px 12px',
        cursor: 'pointer'
      },
      '& li:hover': {
        backgroundColor: comet,
        color: white
      }
    },
    '& svg': {
      position: 'absolute',
      top: '12px',
      right: '14px',
      fill: comet
    }
  },
  selectFiltered: {
    '& button': {
      backgroundColor: comet,
      color: white
    },
    '& ul': {
      '& li': {
        backgroundColor: comet,
        color: white
      },
      '& li:hover': {
        backgroundColor: zircon,
        color: comet
      }
    },
    '& svg': {
      fill: `${white} !important`
    }
  }
}
