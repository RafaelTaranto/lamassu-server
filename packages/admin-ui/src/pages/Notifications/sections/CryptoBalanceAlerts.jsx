import React, { useContext } from 'react'

import NotificationsCtx from '../NotificationsContext'
import SingleFieldEditableNumber from '../components/SingleFieldEditableNumber'

const LOW_BALANCE_KEY = 'cryptoLowBalance'
const HIGH_BALANCE_KEY = 'cryptoHighBalance'

const CryptoBalanceAlerts = ({ section, fieldWidth }) => {
  const { data, save, currency, setEditing, isEditing, isDisabled } =
    useContext(NotificationsCtx)

  return (
    <div className="flex mb-9 h-34 items-center gap-12">
      <SingleFieldEditableNumber
        name={LOW_BALANCE_KEY}
        data={data}
        save={save}
        section={section}
        decoration={currency}
        className="w-50"
        title="Default (Low balance)"
        label="Alert me under"
        editing={isEditing(LOW_BALANCE_KEY)}
        disabled={isDisabled(LOW_BALANCE_KEY)}
        setEditing={it => setEditing(LOW_BALANCE_KEY, it)}
        width={fieldWidth}
      />

      <div className="w-[1px] h-full border-r border-r-comet" />

      <SingleFieldEditableNumber
        name={HIGH_BALANCE_KEY}
        data={data}
        section={section}
        save={save}
        decoration={currency}
        title="Default (High balance)"
        label="Alert me over"
        editing={isEditing(HIGH_BALANCE_KEY)}
        disabled={isDisabled(HIGH_BALANCE_KEY)}
        setEditing={it => setEditing(HIGH_BALANCE_KEY, it)}
        width={fieldWidth}
      />
    </div>
  )
}

export default CryptoBalanceAlerts
