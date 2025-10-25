export interface Payment {
  id: number
  invoice: number
  invoice_details?: {
    id: number
    name: string
    billing_id?: number
    billing_name?: string
  }
  billing_details?: {
    id: number
    name: string
    university_id?: number
    university_name?: string
  }
  university_name?: string
  name: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi'
  status: 'pending' | 'completed' | 'failed'
  transaction_reference?: string
  notes?: string
}

export interface PaymentFormData {
  invoice: string
  name: string
  amount: string
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi'
  status: 'pending' | 'completed' | 'failed'
  transaction_reference?: string
  notes?: string
}

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface Invoice {
  id: number
  billing: number
  name: string
  issue_date: string
  due_date: string
  amount: string
  amount_paid: string
  proforma_invoice?: string
  actual_invoice?: string
  status: PaymentStatus
  notes?: string
  payments: Payment[]
  created_at: string
  updated_at: string
} 
