import { useLazyQuery, useMutation, gql } from '@apollo/client'
import { toUnit } from '@lamassu/coins/lightUtils'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { add, differenceInYears, format, sub, parse } from 'date-fns/fp'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import * as R from 'ramda'
import React, { memo, useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { HelpTooltip } from '../../components/Tooltip'
import { P, Label1 } from '../../components/typography'
import CardIdInverseIcon from '../../styling/icons/ID/card/white.svg?react'
import CardIdIcon from '../../styling/icons/ID/card/zodiac.svg?react'
import PhoneIdInverseIcon from '../../styling/icons/ID/phone/white.svg?react'
import PhoneIdIcon from '../../styling/icons/ID/phone/zodiac.svg?react'
import CamIdInverseIcon from '../../styling/icons/ID/photo/white.svg?react'
import CamIdIcon from '../../styling/icons/ID/photo/zodiac.svg?react'
import CancelInverseIcon from '../../styling/icons/button/cancel/white.svg?react'
import CancelIcon from '../../styling/icons/button/cancel/zodiac.svg?react'
import DownloadInverseIcon from '../../styling/icons/button/download/white.svg?react'
import Download from '../../styling/icons/button/download/zodiac.svg?react'
import TxInIcon from '../../styling/icons/direction/cash-in.svg?react'
import TxOutIcon from '../../styling/icons/direction/cash-out.svg?react'

import { IDButton, ActionButton } from '../../components/buttons'
import {
  primaryColor,
  subheaderColor,
  errorColor,
  offErrorColor,
} from '../../styling/variables'
import { SWEEPABLE_CRYPTOS } from '../../utils/constants'
import * as Customer from '../../utils/customer'
import { formatAddress } from '../../utils/string'

import CopyToClipboard from '../../components/CopyToClipboard.jsx'
import { getStatus, getStatusDetails } from './helper'

const MINUTES_OFFSET = 3
const TX_SUMMARY = gql`
  query txSummaryAndLogs(
    $txId: ID!
    $deviceId: ID!
    $limit: Int
    $from: DateTimeISO
    $until: DateTimeISO
    $txClass: String
    $timezone: String
  ) {
    serverLogsCsv(
      limit: $limit
      from: $from
      until: $until
      timezone: $timezone
    )
    machineLogsCsv(
      deviceId: $deviceId
      limit: $limit
      from: $from
      until: $until
      timezone: $timezone
    )
    transactionCsv(id: $txId, txClass: $txClass, timezone: $timezone)
    txAssociatedDataCsv(id: $txId, txClass: $txClass, timezone: $timezone)
  }
`

const CANCEL_CASH_OUT_TRANSACTION = gql`
  mutation cancelCashOutTransaction($id: ID!) {
    cancelCashOutTransaction(id: $id) {
      id
    }
  }
`

const CANCEL_CASH_IN_TRANSACTION = gql`
  mutation cancelCashInTransaction($id: ID!) {
    cancelCashInTransaction(id: $id) {
      id
    }
  }
`

const getCryptoAmount = tx =>
  toUnit(new BigNumber(tx.cryptoAtoms), tx.cryptoCode).toNumber()

const getCryptoFeeAmount = tx => {
  const feeAmount = toUnit(new BigNumber(tx.fee), tx.cryptoCode).toNumber()

  return new BigNumber(feeAmount)
    .times(tx.rawTickerPrice)
    .toNumber()
    .toFixed(2, 1)
}

const Label = ({ children }) => {
  return (
    <Label1 noMargin className="text-comet mb-1">
      {children}
    </Label1>
  )
}

const DetailsRow = ({ it: tx, timezone }) => {
  const [action, setAction] = useState({ command: null })
  const [errorMessage, setErrorMessage] = useState('')

  const isCashIn = tx.txClass === 'cashIn'

  const zip = new JSZip()

  const [fetchSummary] = useLazyQuery(TX_SUMMARY, {
    onCompleted: data => createCsv(R.filter(it => !R.isEmpty(it), data)),
  })

  const [cancelTransaction] = useMutation(
    isCashIn ? CANCEL_CASH_IN_TRANSACTION : CANCEL_CASH_OUT_TRANSACTION,
    {
      onError: ({ message }) =>
        setErrorMessage(message ?? 'An error occurred.'),
      refetchQueries: () => ['transactions'],
    },
  )

  const commission = BigNumber(tx.profit).toFixed(2, 1) // ROUND_DOWN
  const commissionPercentage = BigNumber(
    Number.parseFloat(tx.commissionPercentage, 2) * 100,
  ).toFixed(2, 1) // ROUND_DOWN
  const fixedFee = Number.parseFloat(tx.fixedFee) || 0
  const fiat = BigNumber(tx.fiat).minus(fixedFee).toFixed(2, 1) // ROUND_DOWN
  const crypto = getCryptoAmount(tx)
  const cryptoFee = tx.fee ? `${getCryptoFeeAmount(tx)} ${tx.fiatCode}` : 'N/A'
  const exchangeRate = BigNumber(fiat).div(crypto).toFixed(2, 1) // ROUND_DOWN
  const displayExRate = `1 ${tx.cryptoCode} = ${exchangeRate} ${tx.fiatCode}`
  const discount = tx.discount ? `-${tx.discount}%` : null

  const parseDateString = parse(new Date(), 'yyyyMMdd')

  const customer = tx.customerIdCardData && {
    name: Customer.formatFullName(tx.customerIdCardData),
    age:
      (tx.customerIdCardData.dateOfBirth &&
        differenceInYears(
          parseDateString(tx.customerIdCardData.dateOfBirth),
          new Date(),
        )) ??
      '',
    country: tx.customerIdCardData.country,
    idCardNumber: tx.customerIdCardData.documentNumber,
    idCardExpirationDate:
      (tx.customerIdCardData.expirationDate &&
        format('yyyy-MM-dd')(
          parseDateString(tx.customerIdCardData.expirationDate),
        )) ??
      '',
  }

  const from = sub({ minutes: MINUTES_OFFSET }, new Date(tx.created))
  const until = add({ minutes: MINUTES_OFFSET }, new Date(tx.created))

  const downloadRawLogs = ({ id: txId, deviceId, txClass }, timezone) => {
    fetchSummary({
      variables: { txId, from, until, deviceId, txClass, timezone },
    })
  }

  const createCsv = async logs => {
    const zipFilename = `tx_${tx.id}_summary.zip`
    const filesNames = R.keys(logs)
    R.map(name => zip.file(name + '.csv', logs[name]), filesNames)
    const content = await zip.generateAsync({ type: 'blob' })
    FileSaver.saveAs(content, zipFilename)
  }

  const hasChainAnalysisError = tx =>
    !R.isNil(tx.errorCode) &&
    R.includes(tx.errorCode, ['scoreThresholdReached', 'walletScoringError'])

  const errorElements = (
    <>
      <Label>Transaction status</Label>
      <span className="font-bold">{getStatus(tx)}</span>
      {getStatusDetails(tx) ? (
        <CopyToClipboard
          removeSpace={false}
          className="font-museo break-normal max-w-45">
          {getStatusDetails(tx)}
        </CopyToClipboard>
      ) : (
        <></>
      )}
    </>
  )

  const walletScoreEl = (
    <div className="flex flex-row items-center">
      <svg width={103} height={10}>
        {R.range(0, 10).map((it, idx) => (
          <circle
            key={idx}
            cx={it * 10 + 6}
            cy={4}
            r={3.5}
            fill={
              it < tx.walletScore
                ? !hasChainAnalysisError(tx)
                  ? primaryColor
                  : errorColor
                : !hasChainAnalysisError(tx)
                  ? subheaderColor
                  : offErrorColor
            }
          />
        ))}
      </svg>
      <P
        noMargin
        className={classNames({
          'font-bold ml-1': true,
          'text-tomato': hasChainAnalysisError(tx),
        })}>
        {tx.walletScore}
      </P>
    </div>
  )

  const getCancelMessage = () => {
    const cashInMessage = `The user will not be able to redeem the inserted bills, even if they subsequently confirm the transaction. If they've already deposited bills, you'll need to reconcile this transaction with them manually.`
    const cashOutMessage = `The user will not be able to redeem the cash, even if they subsequently send the required coins. If they've already sent you coins, you'll need to reconcile this transaction with them manually.`

    return isCashIn ? cashInMessage : cashOutMessage
  }

  const { address, addressDisplay } = formatAddress(tx.cryptoCode, tx.toAddress)

  return (
    <div data-cy="details" className="flex flex-col mt-6">
      <div className="flex flex-row mb-9">
        <div data-cy="direction" className="w-59">
          <Label>Direction</Label>
          <div>
            <span className="mr-3">
              {!isCashIn ? <TxOutIcon /> : <TxInIcon />}
            </span>
            <span>{!isCashIn ? 'Cash-out' : 'Cash-in'}</span>
          </div>
        </div>

        <div data-cy="availableIds" className="w-58">
          <Label>Available IDs</Label>
          <div className="flex gap-1">
            {tx.customerPhone && (
              <IDButton
                name="phone"
                Icon={PhoneIdIcon}
                InverseIcon={PhoneIdInverseIcon}>
                {tx.customerPhone}
              </IDButton>
            )}
            {tx.customerIdCardPhotoPath && !tx.customerIdCardData && (
              <IDButton
                popoverClassname="h-41 w-54"
                name="card"
                Icon={CardIdIcon}
                InverseIcon={CardIdInverseIcon}>
                <img
                  src={`/id-card-photo/${tx.customerIdCardPhotoPath}`}
                  alt=""
                />
              </IDButton>
            )}
            {tx.customerIdCardData && (
              <IDButton
                name="card"
                Icon={CardIdIcon}
                InverseIcon={CardIdInverseIcon}>
                <div className="font-museo flex py-3 px-2 gap-16">
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label>Name</Label>
                      <P noMargin>{customer.name}</P>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <P noMargin>{customer.age}</P>
                    </div>
                    <div>
                      <Label>Country</Label>
                      <P noMargin>{customer.country}</P>
                    </div>
                  </div>
                  <div>
                    <div>
                      <Label>ID number</Label>
                      <P noMargin>{customer.idCardNumber}</P>
                    </div>
                    <div>
                      <Label>Expiration date</Label>
                      <P noMargin>{customer.idCardExpirationDate}</P>
                    </div>
                  </div>
                </div>
              </IDButton>
            )}
            {tx.customerFrontCameraPath && (
              <IDButton
                name="cam"
                Icon={CamIdIcon}
                InverseIcon={CamIdInverseIcon}>
                <img
                  src={`/front-camera-photo/${tx.customerFrontCameraPath}`}
                  alt=""
                />
              </IDButton>
            )}
            {tx.txCustomerPhotoPath && (
              <IDButton
                name="cam"
                Icon={CamIdIcon}
                InverseIcon={CamIdInverseIcon}>
                <img
                  src={`/operator-data/customersphotos/${tx.txCustomerPhotoPath}`}
                  alt=""
                />
              </IDButton>
            )}
          </div>
        </div>
        <div data-cy="exchangeRate" className="w-62">
          <Label>Exchange rate</Label>
          <div>{crypto > 0 ? displayExRate : '-'}</div>
        </div>
        <div data-cy="commission" className="w-54">
          <Label>Commission</Label>
          <div className="flex">
            {`${commission} ${tx.fiatCode} (${commissionPercentage} %)`}
            {discount && (
              <div className="flex items-center py-1 px-2 bg-comet text-white h-6 -mb-6 -mt-1 ml-2 rounded-sm">
                <Label1 className="text-white">{discount}</Label1>
              </div>
            )}
          </div>
        </div>
        <div data-cy="fixedFee">
          <Label>Fixed fee</Label>
          <div>{`${fixedFee} ${tx.fiatCode}`}</div>
        </div>
      </div>
      <div className="flex flex-row justify-between mb-9">
        <div data-cy="address" className="w-70">
          <div className="flex flex-row justify-between items-center">
            <Label>Address</Label>
            {!R.isNil(tx.walletScore) && (
              <HelpTooltip parentElements={walletScoreEl}>
                {`Chain analysis score: ${tx.walletScore}/10`}
              </HelpTooltip>
            )}
          </div>
          <div>
            <CopyToClipboard value={address}>{addressDisplay}</CopyToClipboard>
          </div>
        </div>
        <div data-cy="transactionId" className="w-70">
          <Label>Transaction ID</Label>
          <div>
            {tx.txClass === 'cashOut' ? (
              'N/A'
            ) : (
              <CopyToClipboard>{tx.txHash}</CopyToClipboard>
            )}
          </div>
        </div>
        {tx.txClass === 'cashIn' && (
          <div data-cy="networkFee" className="w-35">
            <Label>Network Fee</Label>
            {cryptoFee}
          </div>
        )}
        <div data-cy="sessionId" className="w-54">
          <Label>Session ID</Label>
          <CopyToClipboard>{tx.id}</CopyToClipboard>
        </div>
      </div>
      <div className="flex flex-row mb-8 gap-10">
        <div data-cy="status" className="62">
          {errorElements}
          {((tx.txClass === 'cashOut' && getStatus(tx) === 'Pending') ||
            (tx.txClass === 'cashIn' && getStatus(tx) === 'Batched')) && (
            <ActionButton
              color="primary"
              Icon={CancelIcon}
              InverseIcon={CancelInverseIcon}
              className="w-40"
              onClick={() =>
                setAction({
                  command: 'cancelTx',
                })
              }>
              Cancel transaction
            </ActionButton>
          )}
        </div>
        {!R.isNil(tx.swept) && R.includes(tx.cryptoCode, SWEEPABLE_CRYPTOS) && (
          <div data-cy="swept" className="w-63">
            <Label>Sweep status</Label>
            <span className="font-bold">{tx.swept ? `Swept` : `Unswept`}</span>
          </div>
        )}
        <div>
          <Label>Other actions</Label>
          <div className="flex flex-row">
            <ActionButton
              color="primary"
              Icon={Download}
              InverseIcon={DownloadInverseIcon}
              className="w-45"
              onClick={() => downloadRawLogs(tx, timezone)}>
              Download raw logs
            </ActionButton>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={action.command === 'cancelTx'}
        title={`Cancel this transaction?`}
        errorMessage={errorMessage}
        toBeConfirmed={tx.machineName}
        message={getCancelMessage()}
        onConfirmed={() => {
          setErrorMessage(null)
          setAction({ command: null })
          cancelTransaction({
            variables: {
              id: tx.id,
            },
          })
        }}
        onDismissed={() => {
          setAction({ command: null })
          setErrorMessage(null)
        }}
      />
    </div>
  )
}

export default memo(
  DetailsRow,
  (prev, next) =>
    prev.it.id === next.it.id &&
    prev.it.hasError === next.it.hasError &&
    prev.it.batchError === next.it.batchError &&
    getStatus(prev.it) === getStatus(next.it),
)
