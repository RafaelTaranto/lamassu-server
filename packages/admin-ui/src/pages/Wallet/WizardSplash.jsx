import React from 'react'
import { H1, P } from '../../components/typography'
import BitcoinLogo from '../../styling/logos/icon-bitcoin-colour.svg?react'
import BitcoinCashLogo from '../../styling/logos/icon-bitcoincash-colour.svg?react'
import DashLogo from '../../styling/logos/icon-dash-colour.svg?react'
import EthereumLogo from '../../styling/logos/icon-ethereum-colour.svg?react'
import LitecoinLogo from '../../styling/logos/icon-litecoin-colour.svg?react'
import MoneroLogo from '../../styling/logos/icon-monero-colour.svg?react'
import TetherLogo from '../../styling/logos/icon-tether-colour.svg?react'
import TronLogo from '../../styling/logos/icon-tron-colour.svg?react'
import USDCLogo from '../../styling/logos/icon-usdc-colour.svg?react'
import ZCashLogo from '../../styling/logos/icon-zcash-colour.svg?react'

import { Button } from '../../components/buttons'

const getLogo = code => {
  switch (code) {
    case 'BTC':
      return BitcoinLogo
    case 'BCH':
      return BitcoinCashLogo
    case 'DASH':
      return DashLogo
    case 'ETH':
      return EthereumLogo
    case 'LTC':
      return LitecoinLogo
    case 'ZEC':
      return ZCashLogo
    case 'USDT':
    case 'USDT_TRON':
      return TetherLogo
    case 'USDC':
      return USDCLogo
    case 'XMR':
      return MoneroLogo
    case 'TRX':
      return TronLogo
    case 'LN':
      return BitcoinLogo
    default:
      return null
  }
}

const WizardSplash = ({ code, name, onContinue }) => {
  const Logo = getLogo(code)

  return (
    <div className="flex flex-col items-center px-10 flex-1">
      <Logo className="max-h-20 max-w-50" />
      <H1 className="mt-6 mb-8">Enable {name}</H1>
      <P className="m-0">
        You are about to enable {name} on your system. This will allow you to
        use this cryptocurrency on your machines. To be able to do that, you’ll
        have to set up all the necessary 3rd party services.
      </P>
      <Button className="mt-auto mb-15" onClick={onContinue}>
        Start configuration
      </Button>
    </div>
  )
}

export default WizardSplash
