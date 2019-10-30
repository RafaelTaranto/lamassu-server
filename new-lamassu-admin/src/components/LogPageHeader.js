import React from 'react'
import FileSaver from 'file-saver'
import moment from 'moment'

import Title from '../components/Title'
import { Info3 } from '../components/typography'
import { FeatureButton, SimpleButton } from '../components/buttons'
import { makeStyles } from '@material-ui/core/styles'
import { ReactComponent as Download } from '../styling/icons/button/download/zodiac.svg'
import { ReactComponent as DownloadActive } from '../styling/icons/button/download/white.svg'

import {
  white,
  fontColor,
  subheaderColor,
  subheaderDarkColor,
  offColor
} from '../styling/variables'

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

const styles = {
  titleAndButtonsContainer: {
    display: 'flex'
  },
  buttonsWrapper: {
    display: 'flex',
    marginLeft: 10,
    '& > *': {
      margin: 'auto 10px'
    }
  }
}

const useStyles = makeStyles(styles)

function LogPageHeader ({ logsResponse, saveMessage, children, loading, sendSnapshot, selected, ...props }) {
  const classes = useStyles()

  const formatDateFile = date => {
    return moment(date).format('YYYY-MM-DD_HH-mm')
  }

  return (
    <div className={classes.titleAndButtonsContainer}>
      <Title>{children}</Title>
      {logsResponse && (
        <div className={classes.buttonsWrapper}>
          <FeatureButton
            Icon={Download}
            InverseIcon={DownloadActive}
            onClick={() => {
              const text = logsResponse.data.logs.map(it => JSON.stringify(it)).join('\n')
              const blob = new window.Blob([text], {
                type: 'text/plain;charset=utf-8'
              })
              FileSaver.saveAs(blob, `${formatDateFile(new Date())}_${selected.name}`)
            }}
          />
          <SimpleButton className={classes.button} disabled={loading} onClick={sendSnapshot}>
            Share with Lamassu
          </SimpleButton>
          <Info3>{saveMessage}</Info3>
        </div>
      )}
    </div>
  )
}

export default LogPageHeader
