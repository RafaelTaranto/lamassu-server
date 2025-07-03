import Chip from '@mui/material/Chip'
import * as R from 'ramda'
import React from 'react'
import { Label1, TL2 } from '../../components/typography'

import { CashOut } from '../../components/inputs'
import { fromNamespace } from '../../utils/config'
import { getCashUnitCapacity, modelPrettifier } from '../../utils/machine'

const CashUnitDetails = ({
  machine,
  bills,
  currency,
  config,
  hideMachineData = false,
}) => {
  const billCount = R.countBy(it => it.fiat)(bills)
  const fillingPercentageSettings = fromNamespace('notifications', config)
  const cashout = fromNamespace('cashOut')(config)
  const getCashoutSettings = id => fromNamespace(id)(cashout)

  const minWidth = hideMachineData ? 'min-w-15' : 'min-w-40'
  const VerticalLine = () => <span className="h-full w-[1px] bg-comet2" />

  return (
    <div className="flex flex-row mt-3 mb-4 gap-10 min-h-30">
      {!hideMachineData && (
        <div className="min-w-52">
          <Label1>Machine Model</Label1>
          <span>{modelPrettifier[machine.model]}</span>
        </div>
      )}
      <div className={`flex flex-col ${minWidth}`}>
        <Label1>Cash box</Label1>
        {R.isEmpty(billCount) && <TL2 noMargin>Empty</TL2>}
        {R.keys(billCount).map((it, idx) => (
          <span className="flex items-center" key={idx}>
            <TL2 className="min-w-7" noMargin>
              {billCount[it]}
            </TL2>
            <Chip label={`${it} ${currency}`} />
          </span>
        ))}
      </div>
      <div className="flex gap-5">
        {machine.numberOfRecyclers === 0 &&
          R.map(it => (
            <>
              <div className="flex flex-col gap-2">
                <Label1 noMargin>{`Cassette ${it}`}</Label1>
                <CashOut
                  width={60}
                  height={40}
                  currency={{ code: currency }}
                  notes={machine.cashUnits[`cassette${it}`]}
                  denomination={
                    getCashoutSettings(machine.id ?? machine.deviceId)[
                      `cassette${it}`
                    ]
                  }
                  threshold={
                    fillingPercentageSettings[`fillingPercentageCassette${it}`]
                  }
                  capacity={getCashUnitCapacity(machine.model, 'cassette')}
                />
              </div>
              {it !== machine.numberOfCassettes && <VerticalLine />}
            </>
          ))(R.range(1, machine.numberOfCassettes + 1))}
        {machine.numberOfRecyclers > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <Label1 noMargin>{`Loading boxes`}</Label1>
              <div className="flex flex-col gap-5">
                {R.range(1, machine.numberOfCassettes + 1).map((it, idx) => (
                  <CashOut
                    key={idx}
                    width={60}
                    height={40}
                    currency={{ code: currency }}
                    notes={machine.cashUnits[`cassette${it}`]}
                    denomination={
                      getCashoutSettings(machine.id ?? machine.deviceId)[
                        `cassette${it}`
                      ]
                    }
                    threshold={
                      fillingPercentageSettings[
                        `fillingPercentageCassette${it}`
                      ]
                    }
                    capacity={getCashUnitCapacity(machine.model, 'cassette')}
                  />
                ))}
              </div>
            </div>
            <VerticalLine />
            {R.map(it => (
              <>
                <div className="flex flex-col gap-2">
                  <Label1 noMargin>
                    {`Recycler ${
                      machine.model === 'aveiro'
                        ? `${it} f/r`
                        : `${it * 2 - 1} - ${it * 2}`
                    }`}
                  </Label1>
                  <div className="flex flex-col gap-5">
                    <CashOut
                      width={60}
                      height={40}
                      currency={{ code: currency }}
                      notes={machine.cashUnits[`recycler${it * 2 - 1}`]}
                      denomination={
                        getCashoutSettings(machine.id ?? machine.deviceId)[
                          `recycler${it * 2 - 1}`
                        ]
                      }
                      threshold={
                        fillingPercentageSettings[
                          `fillingPercentageRecycler${it * 2 - 1}`
                        ]
                      }
                      capacity={getCashUnitCapacity(machine.model, 'recycler')}
                    />
                    <CashOut
                      width={60}
                      height={40}
                      currency={{ code: currency }}
                      notes={machine.cashUnits[`recycler${it * 2}`]}
                      denomination={
                        getCashoutSettings(machine.id ?? machine.deviceId)[
                          `recycler${it * 2}`
                        ]
                      }
                      threshold={
                        fillingPercentageSettings[
                          `fillingPercentageRecycler${it * 2}`
                        ]
                      }
                      capacity={getCashUnitCapacity(machine.model, 'recycler')}
                    />
                  </div>
                </div>
                {it !== machine.numberOfRecyclers / 2 && <VerticalLine />}
              </>
            ))(R.range(1, Math.ceil(machine.numberOfRecyclers / 2) + 1))}
          </>
        )}
      </div>
    </div>
  )
}

export default CashUnitDetails
