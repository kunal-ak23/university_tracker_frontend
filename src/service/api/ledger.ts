import { PaymentLedger, LedgerSummary, LedgerFilters, LedgerFormData, LedgerTransaction } from "@/types/ledger"
import { PaginatedResponse } from "@/types/common"
import { apiFetch } from "./fetch"

export async function getLedgerEntries(filters?: LedgerFilters): Promise<PaginatedResponse<PaymentLedger>> {
  const searchParams = new URLSearchParams()
  
  if (filters?.university && filters.university !== 'all') searchParams.set('university', filters.university)
  if (filters?.start_date) searchParams.set('start_date', filters.start_date)
  if (filters?.end_date) searchParams.set('end_date', filters.end_date)
  if (filters?.account && filters.account !== 'all') searchParams.set('account', filters.account)
  if (filters?.entry_type && filters.entry_type !== 'all') searchParams.set('entry_type', filters.entry_type)
  if (filters?.source && filters.source !== 'all') searchParams.set('source', filters.source)
  if (filters?.search) searchParams.set('search', filters.search)
  if (filters?.page) searchParams.set('page', filters.page.toString())
  
  const queryString = searchParams.toString()
  return apiFetch(`/ledger/${queryString ? `?${queryString}` : ''}`)
}

export async function getLedgerTransactions(filters?: LedgerFilters): Promise<PaginatedResponse<LedgerTransaction>> {
  const searchParams = new URLSearchParams()
  
  if (filters?.university && filters.university !== 'all') searchParams.set('university', filters.university)
  if (filters?.start_date) searchParams.set('start_date', filters.start_date)
  if (filters?.end_date) searchParams.set('end_date', filters.end_date)
  if (filters?.source && filters.source !== 'all') searchParams.set('source', filters.source)
  if (filters?.page) searchParams.set('page', filters.page.toString())
  
  const queryString = searchParams.toString()
  return apiFetch(`/ledger/transactions/${queryString ? `?${queryString}` : ''}`)
}

export async function getLedgerEntry(id: string): Promise<PaymentLedger> {
  return apiFetch(`/ledger/${id}/`)
}

export async function createLedgerEntry(data: LedgerFormData): Promise<PaymentLedger> {
  return apiFetch("/ledger/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export async function updateLedgerEntry(id: string, data: LedgerFormData): Promise<PaymentLedger> {
  return apiFetch(`/ledger/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export async function deleteLedgerEntry(id: string): Promise<void> {
  return apiFetch(`/ledger/${id}/`, {
    method: "DELETE"
  })
}

export async function getLedgerSummary(universityId: string, startDate?: string, endDate?: string): Promise<LedgerSummary> {
  const searchParams = new URLSearchParams()
  searchParams.set('university', universityId)
  if (startDate) searchParams.set('start_date', startDate)
  if (endDate) searchParams.set('end_date', endDate)
  
  return apiFetch(`/ledger/summary/?${searchParams.toString()}`)
}
