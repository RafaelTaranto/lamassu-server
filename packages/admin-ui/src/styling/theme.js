import { createTheme } from '@mui/material/styles'

import typographyStyles from '../components/typography/styles'

import {
  backgroundColor,
  inputFontFamily,
  secondaryColor,
  fontColor,
  offColor,
  subheaderColor,
  fontSize3,
  zircon,
  zircon2,
  primaryColor,
  disabledColor2,
  disabledColor,
  smallestFontSize,
  inputFontWeight,
  spring3,
  spring4,
  tomato,
  mistyRose,
  linen,
  pumpkin,
} from './variables'

const { p } = typographyStyles

let theme = createTheme({
  typography: {
    fontFamily: inputFontFamily,
    root: { ...p },
    body1: { ...p },
  },
  palette: {
    primary: {
      light: secondaryColor,
      dark: secondaryColor,
      main: secondaryColor,
    },
    secondary: {
      light: secondaryColor,
      dark: secondaryColor,
      main: secondaryColor,
    },
    background: {
      default: backgroundColor,
    },
  },
})

theme = createTheme(theme, {
  components: {
    MuiTypography: {
      styleOverrides: {
        root: { ...p },
        body1: { ...p },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: primaryColor,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { ...p },
      },
    },
    MuiIconButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 32,
          height: 20,
          padding: 0,
          margin: theme.spacing(1),
        },
        thumb: {
          width: 16,
          height: 16,
        },
        track: {
          borderRadius: 17,
          border: 'none',
          backgroundColor: offColor,
          opacity: 1,
          transition: theme.transitions.create(['background-color', 'border']),
        },
        switchBase: {
          padding: 2,
          '&.Mui-disabled': {
            color: disabledColor2,
            '& + .MuiSwitch-track': {
              backgroundColor: disabledColor,
              opacity: 1,
            },
          },
          '&.Mui-checked': {
            transform: 'translateX(58%)',
            color: theme.palette.common.white,
            '&.Mui-disabled': {
              color: disabledColor2,
            },
            '& + .MuiSwitch-track': {
              backgroundColor: secondaryColor,
              opacity: 1,
              border: 'none',
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            border: '6px solid #fff',
            boxShadow: '0 0 4px 0 rgba(0,0,0,0.24)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: subheaderColor,
          },
          '&.Mui-selected': {
            '&:hover': {
              backgroundColor: subheaderColor,
            },
            backgroundColor: subheaderColor,
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          color: fontColor,
        },
        noOptions: {
          padding: `6px 16px`,
        },
        option: {
          '&.Mui-focused': {
            backgroundColor: subheaderColor,
          },
          '&[aria-selected="true"]': {
            backgroundColor: `${subheaderColor} !important`,
          },
        },
        paper: {
          color: fontColor,
          margin: 0,
        },
        listbox: {
          padding: 0,
        },
        tag: {
          '&[data-tag-index="0"]': {
            marginLeft: 0,
          },
          margin: 2,
          backgroundColor: subheaderColor,
          borderRadius: 4,
          height: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: primaryColor,
        },
        elevation1: {
          boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: secondaryColor,
          '&.Mui-checked': {
            color: secondaryColor,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: subheaderColor,
          borderRadius: 4,
          margin: theme.spacing(0.5, 0.25),
          height: 18,
        },
        label: {
          fontSize: smallestFontSize,
          color: fontColor,
          fontWeight: inputFontWeight,
          fontFamily: inputFontFamily,
          paddingRight: 4,
          paddingLeft: 4,
        },
        colorDefault: {
          backgroundColor: zircon,
          '& .MuiChip-label': {
            color: primaryColor,
          },
        },
        colorWarning: {
          backgroundColor: linen,
          '& .MuiChip-label': {
            color: pumpkin,
          },
        },
        colorError: {
          backgroundColor: mistyRose,
          '& .MuiChip-label': {
            color: tomato,
          },
        },
        colorSuccess: {
          backgroundColor: spring3,
          '& .MuiChip-label': {
            color: spring4,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          color: fontColor,
        },
        underline: {
          '&:before': {
            borderBottom: `2px solid ${fontColor}`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          font: 'inherit',
          fontSize: fontSize3,
          color: offColor,
        },
        shrink: {
          color: fontColor,
          transform: 'translate(0, 1.7px) scale(0.83)',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: fontColor,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: backgroundColor,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: zircon,
            borderColor: primaryColor,
            borderTopColor: `${primaryColor} !important`,
            '&:hover': {
              backgroundColor: zircon2,
            },
          },
          '&:hover': {
            backgroundColor: zircon2,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        vertical: {
          borderRadius: 8,
          border: 'none',
          borderColor: zircon,
        },
        firstButton: {
          borderTop: '1px solid',
          borderTopColor: zircon,
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
        },
        lastButton: {
          borderTop: '1px solid',
          borderTopColor: zircon,
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
        },
        middleButton: {
          borderTop: '1px solid',
          borderTopColor: zircon,
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
        },
      },
    },
  },
})

export default theme
