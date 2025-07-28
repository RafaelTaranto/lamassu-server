import type { ExpressionBuilder } from 'kysely'
import type {
  CashInTxs,
  Customers,
  DB,
  Devices,
  EditedCustomerData,
  TransactionBatches,
  UnpairedDevices,
} from './types.js'
import type { Nullable } from 'kysely/dist/esm/index.js'

export type CustomerEB = ExpressionBuilder<DB & { cst: Customers }, 'cst'>
export type CustomerWithEditedDataEB = ExpressionBuilder<
  DB & { cst: Customers } & { cstED: EditedCustomerData },
  'cst' | 'cstED'
>
export type CashInEB = ExpressionBuilder<DB & { txIn: CashInTxs }, 'txIn'>
export type CashInWithBatchEB = ExpressionBuilder<
  DB & { txIn: CashInTxs } & {
    txInB: TransactionBatches
  },
  'txIn' | 'txInB'
>

export type CashOutEB = ExpressionBuilder<DB & { txOut: CashOutTxs }, 'txOut'>

export type DevicesAndUnpairedDevicesEB = ExpressionBuilder<
  DB & { d: Nullable<Devices> } & {
    ud: Nullable<UnpairedDevices>
  },
  'd' | 'ud'
>

export type GenericEB = ExpressionBuilder<DB, any>
