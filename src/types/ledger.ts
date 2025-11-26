export type LedgerAccount =
  | 'cash'
  | 'accounts_receivable'
  | 'oem_payable'
  | 'expense'
  | 'commission_expense'
  | 'revenue'
  | 'tds_payable'

export type LedgerEntryType = 'DEBIT' | 'CREDIT'

export interface PaymentLedger {
  id: number
  entry_date: string
  account: LedgerAccount
  entry_type: LedgerEntryType
  amount: number
  memo: string | null
  university: number | null
  university_name: string | null
  oem: number | null
  oem_name: string | null
  billing: number | null
  billing_name: string | null
  payment: number | null
  payment_reference: string | null
  oem_payment: number | null
  expense: number | null
  invoice: number | null
  external_reference: string | null
  reversing: boolean
  created_at: string
  updated_at: string
}

export interface LedgerTransaction {
  id: string
  source_type: 'payment' | 'oem_payment' | 'expense' | 'invoice' | 'ledger_line'
  source_id: number | null
  date: string
  description: string
  memo: string | null
  university: number | null
  university_name: string | null
  cash_in: number
  cash_out: number
  net_cash: number
  accounts_receivable_delta: number
  oem_payable_delta: number
  references: string[]
}

export interface LedgerSummary {
  university_id: number
  date_range: {
    start_date: string | null
    end_date: string | null
  }
  income: {
    payments_received: number
    refunds: number
    total: number
  }
  expenses: {
    operational_expenses: number
    oem_payments: number
    commission_payments: number
    adjustments: number
    total: number
  }
  profit_loss: number
  transaction_count: number
}

export interface LedgerFilters {
  university?: string
  start_date?: string
  end_date?: string
  account?: string
  entry_type?: LedgerEntryType | string
  source?: 'payments' | 'expenses' | 'oem_payments' | string
  search?: string
  page?: number
}

export interface LedgerFormData {
  transaction_type: 'income' | 'expense' | 'oem_payment' | 'commission_payment' | 'refund' | 'adjustment'
  amount: string
  transaction_date: string
  description: string
  university: string
  oem?: string
  billing?: string
  reference_number?: string
  notes?: string
}
