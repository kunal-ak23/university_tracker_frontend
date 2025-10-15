import { PaginatedResponse } from '@/types/api'
import { Expense } from '@/types/expense'
import { apiFetch } from './fetch'

interface GetExpensesParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  university?: number
  batch?: number
  event?: number
  category?: string
  start_date?: string
  end_date?: string
}

export async function getExpenses(params: GetExpensesParams = {}): Promise<PaginatedResponse<Expense>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.ordering) searchParams.append('ordering', params.ordering)
  if (params.university) searchParams.append('university', params.university.toString())
  if (params.batch) searchParams.append('batch', params.batch.toString())
  if (params.event) searchParams.append('event', params.event.toString())
  if (params.category) searchParams.append('category', params.category)
  if (params.start_date) searchParams.append('start_date', params.start_date)
  if (params.end_date) searchParams.append('end_date', params.end_date)

  return apiFetch(`/expenses/?${searchParams.toString()}`)
}

export async function getExpense(id: number): Promise<Expense> {
  return apiFetch(`/expenses/${id}/`)
}

export async function createExpense(payload: Partial<Expense>): Promise<Expense> {
  return apiFetch(`/expenses/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateExpense(id: number, payload: Partial<Expense>): Promise<Expense> {
  return apiFetch(`/expenses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteExpense(id: number): Promise<void> {
  return apiFetch(`/expenses/${id}/`, { method: 'DELETE' })
}


