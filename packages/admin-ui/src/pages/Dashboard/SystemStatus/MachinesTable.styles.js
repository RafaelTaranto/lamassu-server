import {
  backgroundColor,
  offColor,
  errorColor,
  primaryColor,
} from 'src/styling/variables'

const styles = {
  label: {
    margin: 0,
    color: offColor,
  },
  row: {
    backgroundColor: backgroundColor,
    borderBottom: 'none',
  },
  clickableRow: {
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
  },
  error: {
    color: errorColor,
  },
  button: {
    color: primaryColor,
    minHeight: 0,
    minWidth: 0,
    padding: 0,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    marginBottom: -40,
  },
  buttonLabel: {
    position: 'absolute',
    bottom: 160,
    marginBottom: 0,
  },
  statusHeader: {
    marginLeft: 2,
  },
  tableBody: {
    overflow: 'auto',
  },
  tl2: {
    display: 'inline',
  },
  label1: {
    display: 'inline',
  },
  machinesTableContainer: {
    height: 220,
  },
  expandedMachinesTableContainer: {
    height: 414,
  },
  centerLabel: {
    marginBottom: 0,
    padding: 0,
    textAlign: 'center',
  },
  machineNameWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineRedirectIcon: {
    marginLeft: 10,
  },
}

export default styles
