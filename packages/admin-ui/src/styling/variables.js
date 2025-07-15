const version = 9

// Primary
const zodiac = '#1b2559'
const spring = '#48f694'

// Secondary
const comet = '#5f668a'
const comet2 = '#72799d'
const comet3 = '#525772'
const spring2 = '#44e188'
const spring3 = '#ecfbef'
const spring4 = '#3fd07e'
const zircon = '#ebefff'
const zircon2 = '#dbdfed'

// Cash-in/cash-out
const java = '#16d6d3'
const neon = '#5a67ff'

// Neutral
const dust = '#dddddd'
const concrete = '#f2f2f2'
const ghost = '#fafbff'
const white = '#ffffff'

// Error
const tomato = '#ff584a'
const tomato1 = '#E45043'
const tomato2 = '#CE463A'
const mistyRose = '#ffeceb'
const pumpkin = '#ff7311'
const linen = '#fbf3ec'

// Color Variables
const primaryColor = zodiac

const secondaryColor = spring
const secondaryColorDark = spring2
const secondaryColorDarker = spring4

const backgroundColor = ghost
const subheaderColor = zircon
const subheaderDarkColor = zircon2
const disabledColor = dust
const disabledColor2 = concrete
const fontColor = primaryColor
const offColor = comet
const offDarkColor = comet2
const offDarkerColor = comet3
const errorColor = tomato
const errorColorDark = tomato1
const errorColorDarker = tomato2
const offErrorColor = mistyRose

// General
const spacer = 8

// Buttons
const linkPrimaryColor = secondaryColor
const linkSecondaryColor = tomato

// Fonts
const fontPrimary = 'Mont'
const fontSecondary = 'MuseoSans'
const fontMonospaced = 'BPmono'

const fontSize1 = 24
const fontSize2 = 20
const fontSize3 = 16
const fontSize4 = 14
const fontSize5 = 13

const smallestFontSize = fontSize5
const inputFontSizeSm = fontSize4
const inputFontSize = fontSize3
const inputFontSizeLg = fontSize1
const inputFontWeight = 500
const inputFontWeightBold = 700
const inputFontFamily = fontSecondary

// Breakpoints
const sm = 576
const md = 768
const lg = 992
const xl = 1200
const xxl = 1440

// Table
let tableHeaderHeight = spacer * 4
let tableCellHeight = spacer * 6

if (version === 8) {
  tableHeaderHeight = spacer * 5
  tableCellHeight = spacer * 7 - 2
}

const tableDoubleHeaderHeight = tableHeaderHeight * 2

const tableHeaderColor = primaryColor
const tableErrorColor = mistyRose
const tableSuccessColor = spring3

export {
  version,
  // colors
  white,
  zircon,
  zodiac,
  ghost,
  zircon2,
  comet,
  comet2,
  comet3,
  spring2,
  spring3,
  spring4,
  tomato,
  pumpkin,
  mistyRose,
  java,
  neon,
  linen,
  // named colors
  primaryColor,
  secondaryColor,
  secondaryColorDark,
  secondaryColorDarker,
  subheaderColor,
  subheaderDarkColor,
  backgroundColor,
  offColor,
  offDarkColor,
  offDarkerColor,
  fontColor,
  disabledColor,
  disabledColor2,
  linkPrimaryColor,
  linkSecondaryColor,
  errorColor,
  errorColorDarker,
  errorColorDark,
  offErrorColor,
  // font sizes
  fontSize1,
  fontSize2,
  fontSize3,
  fontSize4,
  fontSize5,
  fontPrimary,
  fontSecondary,
  fontMonospaced,
  // named font sizes
  smallestFontSize,
  inputFontSize,
  inputFontSizeSm,
  inputFontSizeLg,
  inputFontFamily,
  inputFontWeight,
  inputFontWeightBold,
  // screen sizes
  sm,
  md,
  lg,
  xl,
  xxl,
  // sizes
  spacer,
  // table sizes
  tableHeaderHeight,
  tableDoubleHeaderHeight,
  tableCellHeight,
  tableHeaderColor,
  tableErrorColor,
  tableSuccessColor,
}
