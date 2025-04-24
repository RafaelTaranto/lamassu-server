import typographyStyles from 'src/components/typography/styles'
import {
  placeholderColor,
  primaryColor,
  mainWidth,
  spring2,
  spring3,
  errorColor
} from 'src/styling/variables'

const { tl2, p } = typographyStyles

const fill = '100%'
const flexDirection = 'column'

const styles = {
  wrapper: {
    width: mainWidth,
    height: fill,
    margin: '0 auto',
    flex: 1,
    display: 'flex',
    flexDirection
  },
  contentDiv: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row'
  },
  headerDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contentWrapper: {
    marginLeft: 48
  }
}

export default styles
