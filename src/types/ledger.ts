export interface PaymentLedger {
  id: number
  transaction_type: 'income' | 'expense' | 'oem_payment' | 'commission_payment' | 'refund' | 'adjustment'
  amount: number
  transaction_date: string
  description: string
  university: number | null
  university_name: string | null
  oem: number | null
  oem_name: string | null
  billing: number | null
  billing_name: string | null
  payment: number | null
  payment_reference: string | null
  running_balance: number
  reference_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
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
  transaction_type?: string
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
