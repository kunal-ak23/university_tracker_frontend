export type ExpenseCategory =
  | 'marketing'
  | 'travel'
  | 'operations'
  | 'logistics'
  | 'venue'
  | 'speaker'
  | 'other'

export interface University {
  id: number
  name: string
}

export interface Batch {
  id: number
  name: string
}

export interface Event {
  id: number
  title: string
}

export interface Expense {
  id: number
  university: number
  university_details: University
  batch?: number | null
  batch_details?: Batch | null
  event?: number | null
  event_details?: Event | null
  category: ExpenseCategory
  amount: string | number
  incurred_date: string
  description?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseFormData {
  university: number
  batch?: number | null
  event?: number | null
  category: ExpenseCategory
  amount: string
  incurred_date: string
  description?: string
  notes?: string
}


