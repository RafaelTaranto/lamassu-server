import {
  white,
  fontColor,
  subheaderColor,
  subheaderDarkColor,
  offColor,
  offDarkColor
} from '../../styling/variables'

import typographyStyles from '../typography/styles'

const { label } = typographyStyles

const colors = (color1, color2, color3) => {
  return {
    backgroundColor: color1,
    '&:hover': {
      backgroundColor: color2
    },
    '&:active': {
      backgroundColor: color3
    }
  }
}

const size = 45
const svgSize = 25

export default {
  featureButton: {
    cursor: 'pointer',
    border: 'none',
    height: size,
    width: size,
    outline: 0,
    borderRadius: size / 2,
    display: 'flex'
  },
  primary: {
    extend: colors(subheaderColor, subheaderDarkColor, offColor),
    '&:active': {
      color: white,
      '& $actionButtonIcon': {
        display: 'none'
      },
      '& $actionButtonIconActive': {
        display: 'flex'
      }
    },
    '& $actionButtonIconActive': {
      display: 'none'
    }
  },
  secondary: {
    extend: colors(offColor, offDarkColor, white),
    color: white,
    '&:active': {
      color: fontColor,
      '& $actionButtonIcon': {
        display: 'flex'
      },
      '& $actionButtonIconActive': {
        display: 'none'
      }
    },
    '& $actionButtonIcon': {
      display: 'none'
    },
    '& $actionButtonIconActive': {
      display: 'flex'
    }
  },
  actionButtonIcon: {
    margin: 'auto',
    '& svg': {
      width: svgSize,
      height: svgSize
    }
  },
  actionButtonIconActive: {}
}
