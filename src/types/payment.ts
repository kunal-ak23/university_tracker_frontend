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

export interface InvoiceOEMPayment {
  id: number
  invoice: number
  amount: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'online'
  status: 'pending' | 'completed' | 'failed'
  payment_date: string
  reference_number?: string
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceTDS {
  id: number
  invoice: number
  amount: string
  tds_rate: string
  deduction_date: string
  reference_number?: string
  certificate_type?: 'form_16a' | 'form_16b' | 'form_16' | 'form_26as' | 'certificate' | 'other'
  certificate_document?: string
  description?: string
  notes?: string
  tds_note?: string
  created_at: string
  updated_at: string
}

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
  oem_payments?: InvoiceOEMPayment[]
  tds_entries?: InvoiceTDS[]
  oem_transfer_amount?: string
  oem_transfer_paid?: string
  oem_transfer_remaining?: string
  oem_overpayment_amount?: string
  total_tds?: string
  net_invoice_amount?: string
  net_amount_received?: string
  net_remaining_amount?: string
  created_at: string
  updated_at: string
} 
